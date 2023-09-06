import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Container, Message, Loader } from 'semantic-ui-react';
import agent from '../../app/api/agent';


const UnsubscribeMessage: React.FC<{type: 'success' | 'error'}> = ({type}) => {
  return (
    <Message
      {...{[type]: true}}
      header={type === 'success' ? "Successfully Unsubscribed" : "Unsubscribe Failed"}
      content={type === 'success' ? "You won't receive further notifications." : "Something went wrong. Please try again."}
    />
  );
}

export default function Unsubscribe(){
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [loading, setLoading] = useState(false);
    const {id} = useParams<{id: string}>();

    const handleUnsubscribe = async () => {
      setLoading(true);
      try {
          await agent.AddToEEMCalendars.delete(id);
          setShowSuccess(true);
      } catch (error) {
          setShowError(true);
      } finally {
          setLoading(false);
      }
    }

    return (
      <Container textAlign='center'>
        <div style={{ padding: '20px' }}>
          {loading && <Loader active inline='centered' />}
          {!loading && (
            <>
              {showSuccess ? (
                <UnsubscribeMessage type='success' />
              ) : (
                <>
                  <h1>Do you want to unsubscribe?</h1>
                  <Button color="red" onClick={handleUnsubscribe}>
                    Unsubscribe
                  </Button>
                  {showError && <UnsubscribeMessage type='error' />}
                </>
              )}
            </>
          )}
        </div>
      </Container>
    );
}
