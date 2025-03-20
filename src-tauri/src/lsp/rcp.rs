use serde::{Deserialize, Serialize};
use serde_json::{self, Value};

#[derive(Deserialize, Serialize, Debug)]
pub struct BaseMessage{
    #[serde(rename = "method")]
    method: String,
}

pub fn encode_message<T: Serialize>(msg: T) -> String{
    let content = serde_json::to_string(&msg).unwrap_or_else(|e| return e.to_string());
    return format!("Content-Length: {}\r\n\r\n{}", content.len(), content)
}

pub fn decode_message(msg: &[u8]) -> Result<(String, Value), &'static str>{
    match byte_cut(msg, b"\r\n\r\n"){
        Some((header, content)) => {
            let header_str = String::from_utf8_lossy(header);
            if let Some(start) = header_str.find("Content-Length: "){
                let startindex = start + "Content-Length: ".len();
                let endindex = header_str[startindex..].find(&['\r', '\n'][..]).map(|i| startindex + i).unwrap_or(header_str.len());

                let content_length: usize = header_str[startindex..endindex].trim().parse().expect("Failed to parse Content-Length");

                if content_length != content.len(){
                    return Err("Specified Content-Length does not match with received content length");
                }

                let content_str = String::from_utf8_lossy(&content[..content_length]).to_string();

                let message: Value = serde_json::from_str(&content_str).expect("Invalid JSON format");
                Ok((content_str, message)) 
            }else {
                Err("Content-Length not found in header")
            }
        }
        None => Err("Could not find message in JSON-RPC format")
    }
}

fn byte_cut<'a>(slice: &'a [u8], separator: &'a [u8]) -> Option<(&'a [u8], &'a [u8])>{
    if let Some(index) = slice.windows(separator.len()).position(|window| window == separator){
        let before = &slice[..index];
        let after = &slice[index + separator.len()..];
        Some((before, after))
    }else {
        None
    }
}


#[cfg(test)]
mod tests{

    use super::*;

    #[derive(Serialize, Debug)]
    struct EncodingExample{
        testing: bool
    }

    #[test]
    fn encoding_test(){
        let expected = "Content-Length: 16\r\n\r\n{\"testing\":true}";
        let actual = encode_message(EncodingExample{testing: true});
        assert_eq!(actual, expected)
    }

    #[test]
    fn decoding_test(){
        let message = b"Content-Length: 54\r\n\r\n{\"jsonrpc\": \"2.0\", \"method\": \"sum\", \"params\": [1,2,3]}";

        match decode_message(message){
            Ok((content, method)) => {
                assert_eq!(content.len(), 54);
                assert_eq!(content, "{\"jsonrpc\": \"2.0\", \"method\": \"sum\", \"params\": [1,2,3]}");
                assert_eq!(method, "sum")
            },
            Err(e) => println!("Error: {}", e)
        };
    }
}