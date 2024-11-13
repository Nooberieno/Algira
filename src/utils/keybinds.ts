export const open_dialog_bindings = (editor: any, open_file_callback: () => void) => {
    const handle_keydown = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.key === 'o') {
            event.preventDefault()
            open_file_callback()
        }
    };

    window.addEventListener('keydown', handle_keydown)

    return () => {
        window.removeEventListener('keydown', handle_keydown)
    };
};

export const save_existing_file = (editor: any, save_file_callback: () => void) => {
    const handle_keydown = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault()
            save_file_callback()
        }
    };
    
    window.addEventListener('keydown', handle_keydown)

    return () => {
        window.removeEventListener('keydown', handle_keydown)
    };
}