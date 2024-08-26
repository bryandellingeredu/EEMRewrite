import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { Button, ButtonGroup, Divider, Header, Icon, TextArea, Form } from "semantic-ui-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import agent from "../../app/api/agent";
import { toast } from "react-toastify";

interface Props {
  title: string
  start: string
  end: string
  room: string
}

export default observer(function OutlookOnlyModal({ title, start, end, room }: Props) {
  const { modalStore } = useStore();
  const { closeModal } = modalStore;
  
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComments(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try{
        await agent.Tickets.create(title,start,end,room, comments);
        setSubmitting(false);
        toast.info(`A ticket has been created for  ${title} `, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
        closeModal();
    }catch(error){
        setSubmitting(false);
        toast.error(`An error occured submitting the ticket`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
     console.log(error);
    }
  };

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
      <Header as="h2">
        <Header.Content>
          Unable to find EEM Event
          <Header.Subheader>This event may have been created in Outlook</Header.Subheader>
        </Header.Content>
      </Header>
      <Divider />
      <p>The event {title} may have been created using Outlook instead of the EEM so no EEM information is available.</p>
      <p>If you feel this is in error and this event should be in the EEM, please click the
        button below and a Ticket will be created to fix this event. You may add any additional information in the text box. You will be notified via email when the event is fixed.
      </p>
      <Form onSubmit={handleSubmit}>
        <Form.Field>
          <label>Additional Comments</label>
          <TextArea 
            placeholder='Enter any additional comments here...' 
            value={comments}
            onChange={handleCommentsChange}
          />
        </Form.Field>
        <p>
          <ButtonGroup size="large">
            <Button secondary content='Cancel' onClick={() => closeModal()}  />
            <Button primary type="submit" content='Submit Ticket' loading={submitting} disabled={submitting} />
          </ButtonGroup>
        </p>
      </Form>
    </>
  );
});
