use serde::{Deserialize, Serialize};
use serde_json;

#[derive(Deserialize, Serialize, Debug)]
pub struct BaseMessage{
    #[serde(rename = "method")]
    method: String,
}

pub fn encode_message<T: Serialize>(msg: T) -> String{
    let content = serde_json::to_string(&msg).unwrap_or_else(|e| return e.to_string());
    return format!("Content-Length: {}\r\n\r\n{}", content.len(), content)
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
}