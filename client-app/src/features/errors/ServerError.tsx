import { observer } from "mobx-react-lite";
import { Button, Container, Header, Message, Segment } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import { NavLink } from "react-router-dom";

export default observer( function ServerError(){
    const {commonStore} = useStore();
    return(
     <Container>
        <Header as='h1' content='Something Went Wrong' />
        <Header sub as='h5' content= 'An unexpected error occured' />
      {/*  <Header sub as='h5' content={commonStore.error?.message} /> */}

        {/*commonStore.error?.details &&
        <Segment>
          <Header as='h4' content='Stack trace' color='teal' />
          <code style={{marginTop: '10px'}}>
            {commonStore.error.details}
          </code>
        </Segment>
    */}

<Message
    error
    header='An error has occured'
    list={[
      'Something went wrong with the EEM.',
      'The relevant information has been collected and is being forwarded to the developers.',
    ]}
  />
    <Button
                as={NavLink}
                to={`${process.env.PUBLIC_URL}/`}
                positive
                content="Return to the EEM"
              />
     </Container>
    );
})