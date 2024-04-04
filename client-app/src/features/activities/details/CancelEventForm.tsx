import { Form, Formik} from "formik";
import { useState} from "react";
import { toast } from "react-toastify";
import {  Button, Divider, Header, Icon } from "semantic-ui-react";
import * as Yup from 'yup';
import agent from "../../../app/api/agent";
import MyTextArea from "../../../app/common/form/MyTextArea";
import { Link, useHistory } from "react-router-dom";
import { useStore } from "../../../app/stores/store";

interface Props{
    activityId: string;
    title: string;
    setReloadTrigger: () => void
}
interface Values {
    reason: string;
  }

export default function CancelEventForm({activityId, title, setReloadTrigger} : Props){
    const [saving, setSaving] = useState(false);
    const history = useHistory();
    const {modalStore} = useStore();
    const {closeModal} = modalStore;
    
    const handleCancel = () => {
        closeModal();
    }

    async function handleFormSubmit(values: Values) {
        try {
          setSaving(true);
          await agent.Activities.cancel(activityId, values.reason);
            toast.success("Event Cancelled");
            setSaving(false);
            setReloadTrigger();
            closeModal();
          }
         catch (e) {
          console.log(e);
          toast.error("an error occured during save please try again");
          setSaving(false);

        }
      }


    return (
        <>
        <Formik
        initialValues={{
          reason: ''
        }}
        onSubmit={(values) => handleFormSubmit(values)}
        validationSchema={Yup.object({
          reason: Yup.string().required()
        })}
      >
        {({ handleSubmit, values }) => (
          <Form
            className="ui form error"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <Header
              as="h2"
              content={
               `You are about to Cancel ${title}`
              }
              color="teal"
              textAlign="center"
            />
            <MyTextArea name="reason" placeholder="Enter the Cancelation Reason" rows={3}/>
    
            <Button
                disabled={saving}
                loading={saving}
                positive
                content="Cancel This Event"
                type="submit"
                floated="right"
              />
              <Button onClick={handleCancel}
              content="Never Mind Take Me Back"
              floated="right"
              secondary/>

          </Form>

        )}
      </Formik>
      <div style={{paddingTop: '20px'}} />
      </>
    )

}