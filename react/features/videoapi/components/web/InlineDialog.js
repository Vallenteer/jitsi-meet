import React, { useEffect, useRef } from 'react';


export default function InlineDialog(props) {
    const {
        children,
        content,
        onClose,
        isOpen
        } = props
    const ref = useRef(null);

        useEffect(() => {
            function handleClickOutside(event) {
                if (ref.current && !ref.current.contains(event.target)) {
                    if (onClose) {
                        onClose();
                    }
                }
            }

            if (isOpen) {
                document.addEventListener("mousedown", handleClickOutside);
                return () => {
                    document.removeEventListener("mousedown", handleClickOutside);
                };
            }

        }, [ref, isOpen]);


    return (
        <div ref={ ref } className='videoapi-inline-dialog'>
            { children }
            { isOpen && content }
        </div>
    );
}


