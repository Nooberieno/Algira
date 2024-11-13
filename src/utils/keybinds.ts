export const setup_bindings = (editor: any, open_file_callback: () => void) => {
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