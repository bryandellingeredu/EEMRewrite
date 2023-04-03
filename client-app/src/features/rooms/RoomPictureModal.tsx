import { Button, Icon, Image } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";

interface Props{
    url: string
}

export default function RoomPictureModal({url}: Props){
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
            onClick={() => closeModal()}> 
            <Icon name="close" />
          </Button>
          <Image size='huge' src={url}/>
          </>
    )

}