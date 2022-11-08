import { makeAutoObservable } from "mobx"

interface Modal {
    open: boolean;
    body: JSX.Element | null;
    size?: string;
}

export default class ModalStore {
    modal: Modal = {
        open: false,
        body: null
    }

    constructor() {
        makeAutoObservable(this)
    }

    openModal = (content: JSX.Element,
         size? : string) => {
        this.modal.open = true;
        this.modal.body = content;
        if(size){
            this.modal.size = size;
        }

    }

    closeModal = () => {
        this.modal.open = false;
        this.modal.body = null;
    }
}