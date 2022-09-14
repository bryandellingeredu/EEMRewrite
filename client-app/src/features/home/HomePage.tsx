import { Link } from "react-router-dom";
import { Container, Header, Segment, Image, Button } from "semantic-ui-react";

export default function HomePage(){
    return(
        <Segment inverted textAlign='center' vertical className='masthead'>
    <Container text>
    <Header as='h1' inverted>
                    <Image size='massive' src='/assets/logo.png' alt='logo' style={{ marginBottom: 12 }} />
                   The EEM
                </Header>
    <Header as ='h2' inverted content = 'Welcome to the Enterprise Event Manager '/>
    <Button as={Link} to='/activities' size='huge' inverted>
        Take me to the Events
    </Button>
    </Container>
        </Segment>
    )
}