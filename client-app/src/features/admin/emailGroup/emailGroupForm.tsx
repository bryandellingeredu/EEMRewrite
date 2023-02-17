import { observer } from "mobx-react-lite";
import { NavLink, useHistory, useParams } from "react-router-dom";
import {
  Button,
  Divider,
  Header,
  Icon,
  Form as SemanticForm,
  Label,
  Grid,
  Segment
} from "semantic-ui-react";
import { EmailGroupMember } from "../../../app/models/emailGroupMember";
import { useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import MyTextInput from "../../../app/common/form/MyTextInput";
import MySemanticCheckBox from "../../../app/common/form/MySemanticCheckbox";
import { useStore } from "../../../app/stores/store";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import * as Yup from "yup";
import agent from "../../../app/api/agent";
import { v4 as uuid } from "uuid";
import { EmailGroupMemberPostData } from "../../../app/models/emailGroupMemberPostData";
import { toast } from "react-toastify";

interface Values {
  id: string;
  email: string;
  displayName: string;
  options: {};
}

export default observer(function EmailGroupForm() {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [emailGroupMember, setEmailGroupMember] = useState<EmailGroupMember>({
    id: "",
    email: "",
    displayName: "",
    emailGroups: [],
  });
  const { emailGroupStore } = useStore();
  const { emailGroups, loadEmailGroups } = emailGroupStore;
  const [checkBoxOptions, setCheckBoxOptions] = useState({});
  const [emailGroupMembers, setEmailGroupMembers] = useState<
    EmailGroupMember[]
  >([]);
  const [noRolesError, setNoRolesError] = useState(false);
  const [emailAlreadyUsed, setEmailAlreadyUsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const getCheckboxOptions = () => {
    return emailGroups.reduce((acc, curr) => {
      acc[curr.id] = false;
      return acc;
    }, {} as { [key: string]: {} });
  };

  useEffect(() => {
    setLoading(true);
    if (!emailGroups || emailGroups.length < 1) {
      loadEmailGroups();
    } else {
      if (id) {
        agent.EmailGroups.details(id).then((member) => {
          setEmailGroupMember({
            id: member.id,
            email: member.email,
            displayName: member.displayName,
            emailGroups: [],
          });
          const array1 = member.emailGroups.map((x) => x.id);
          const array2 = emailGroups.map((x) => x.id);
          let result: { [key: string]: boolean } = {};
          array2.forEach((item) => {
            result[item] = array1.includes(item);
            setCheckBoxOptions(result);
          });
          setLoading(false);
        });
      } else {
        const options = getCheckboxOptions();
        setCheckBoxOptions(options);
        setLoading(false);
      }
    }
  }, [emailGroups]);

  useEffect(() => {
    agent.EmailGroups.getEmailGroupMembers()
      .then((response) => {
        setEmailGroupMembers(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  async function handleFormSubmit(values: Values) {
    try {
      setSaving(true);
      setNoRolesError(false);
      setEmailAlreadyUsed(false);
      let error = false;
      if (
        !values.options ||
        !Object.values(values.options).some((val) => val)
      ) {
        setNoRolesError(true);
        setSaving(false);
        error = true;
      }
      if (emailGroupMembers && emailGroupMembers.length > 0) {
        const usedEmails = emailGroupMembers
          .map((x) => x.email)
          .filter((x) => x !== emailGroupMember.email);
        if (
          usedEmails
            .map((x) => x.toLowerCase())
            .includes(values.email.toLowerCase())
        ) {
          setEmailAlreadyUsed(true);
          setSaving(false);
          error = true;
        }
      }
      if (!error) {
        const data: EmailGroupMemberPostData = {
          id: values.id || uuid(),
          email: values.email,
          displayName: values.displayName,
          roleIds: Object.entries(values.options)
            .filter(([key, value]) => value)
            .map(([key, value]) => key),
        };
        await agent.EmailGroups.post(data);
        toast.success(" Save Successfull");
        setSaving(false);
        history.push(`${process.env.PUBLIC_URL}/emailGroupTable`);
      }
    } catch (e) {
      console.log(e);
      toast.error("an error occured during save please try again");
      setSaving(false);
    }
  }

  return (
    <>
      <Divider horizontal>
        <Header as="h2">
          <Icon name="group" />
          {id ? "Edit" : "Create"} Email Group Member
        </Header>
      </Divider>
      {loading && <LoadingComponent content="loading form..." />}
      {!loading && (
        <Formik
          enableReinitialize
          initialValues={{
            id: emailGroupMember.id,
            email: emailGroupMember.email,
            displayName: emailGroupMember.displayName,
            options: checkBoxOptions,
          }}
          onSubmit={(values) => handleFormSubmit(values)}
          validationSchema={Yup.object({
            displayName: Yup.string().required(),
            email: Yup.string().required().email(),
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
                  id
                    ? `Edit ${values.displayName}`
                    : "Add a new Email Group User"
                }
                color="teal"
                textAlign="center"
              />
              <MyTextInput name="displayName" placeholder="Display Name" />
              <MyTextInput name="email" placeholder="Email" />

              {emailAlreadyUsed && (
                <Label basic color="red">
                  This email address is already in use, please use a different
                  one or update the existing user
                </Label>
              )}

              <Divider horizontal>
                <Header as="h5">
                  Choose What Email Groups the User Belongs To
                </Header>
              </Divider>

               <Grid>
                <Grid.Row>
                {Object.keys(checkBoxOptions).map((checkboxOptionId) => (
                  <Grid.Column width={4}  key={checkboxOptionId}>
                  <MySemanticCheckBox
                    name={`options.${checkboxOptionId}`}
                    label={
                      emailGroups.find((x) => x.id === checkboxOptionId)?.name
                    }
                 
                  />
                  </Grid.Column>
                ))}
                </Grid.Row>
             </Grid>

              {noRolesError && (
                <Label basic color="red">
                  You must select at least one role
                </Label>
              )}
              <Segment clearing style={{backgroundColor: '#eaeaea', borderColor: '#eaeaea'}}>
              <Button
                icon
                color="grey"
                type="button"
                floated="right"
                as={NavLink}
                to={`${process.env.PUBLIC_URL}/emailGroupTable`}
              >
                {" "}
                Cancel
              </Button>
              <Button
                disabled={saving}
                loading={saving}
                positive
                content="Save"
                type="submit"
                floated="right"
              />
              </Segment>
            </Form>
          )}
        </Formik>
      )}
    </>
  );
});
