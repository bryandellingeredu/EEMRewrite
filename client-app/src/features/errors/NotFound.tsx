import { Link } from "react-router-dom";
import { Button, Header, Icon, Segment } from "semantic-ui-react";

export default function NotFound(){
    return(
        <Segment placeholder>
           <Header icon>
              <Icon name='search' />
              Oops - we've looked every and could not find this.
           </Header>
           <Segment.Inline>
            <Button as={Link} to={`${process.env.PUBLIC_URL}/activities`} primary>
                Return to Events Page
            </Button>
           </Segment.Inline>
        </Segment>
    )
}