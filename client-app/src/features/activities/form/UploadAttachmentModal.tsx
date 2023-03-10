import { Button, Divider, Header, Icon } from "semantic-ui-react";
import DocumentUploadWidget from "../../../app/common/documentUpload/documentUploadWidget";
import { useStore } from "../../../app/stores/store";

interface Props{
    loading: boolean;
    uploadDocument: (file: any) => void
    color: string
}

export default function UploadAttachmentModal({loading, uploadDocument, color}: Props){
    const { modalStore } = useStore();
    const {closeModal} = modalStore;
    return (
        <>
          <Button
            floated="right"
            icon
            size="mini"
            color="black"
            compact
            onClick={() => closeModal()}
          >
            <Icon name="close" />
          </Button>

          <Divider horizontal>
            <Header as="h2">
                <Icon name='paperclip' />     
              Add Attachment
            </Header>
          </Divider>

          <DocumentUploadWidget uploadDocument={uploadDocument} loading={loading} color={color}/>
          </>
          )
        }