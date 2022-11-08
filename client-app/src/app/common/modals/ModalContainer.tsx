import { observer } from 'mobx-react-lite';
import { Modal } from 'semantic-ui-react';
import { useStore } from '../../stores/store';

export default observer(function ModalContainer() {
    const {modalStore} = useStore();

    return (
        <Modal open={modalStore.modal.open} onClose={modalStore.closeModal}
         size={modalStore.modal.size === 'tiny' ? 'tiny' : 
         modalStore.modal.size === 'mini' ? 'mini' :
         modalStore.modal.size === 'small' ? 'small' :
         modalStore.modal.size === 'large' ? 'large' :
         modalStore.modal.size === 'fullscreen' ? 'fullscreen' : undefined}  >
            <Modal.Content>
                {modalStore.modal.body}
            </Modal.Content>
        </Modal>
    )
})