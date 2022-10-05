import { observer } from "mobx-react-lite";
import { Button, Grid, Message, Segment, Icon } from "semantic-ui-react";
import { GraphRoom } from "../../app/models/graphRoom";
import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';
import { Login } from "@microsoft/mgt-react";
import { Link, useHistory, useParams } from "react-router-dom";

function useIsSignedIn(): [boolean] {
    const [isSignedIn, setIsSignedIn] = useState(false);
    useEffect(() => {
      const updateState = () => {
        const provider = Providers.globalProvider;
        setIsSignedIn(provider && provider.state === ProviderState.SignedIn);
      };
  
      Providers.onProviderUpdated(updateState);
      updateState();
  
      return () => {
        Providers.removeProviderUpdatedListener(updateState);
      }
    }, []);
    return [isSignedIn];
  }


interface Props{
        room: GraphRoom
        startDate: Date
        endDate: Date
    }

    export default observer (function RoomReservationButtons({room, startDate, endDate}: Props){

        const [isSignedIn] = useIsSignedIn();
        const history = useHistory();
        const handleNonDepartmentReservationClick = () =>{
            history.push({
                pathname: '/reserveNonDepartmentRoom',
                state: {
                  startDate,
                  endDate,
                  displayName: room.displayName,
                  roomEmail: room.emailAddress
                }
              })
        }

        return(
      <Segment>
          {!isSignedIn &&
     <>
           <Grid>
                    <Grid.Column width={5}>
                    <Login/>
                    </Grid.Column>
                    <Grid.Column width={11}>
                       <div style={{marginTop: '15px'}}>to your edu account to reserve this room</div> 
                    </Grid.Column>
                   
                 
           </Grid>
       
       </>
     }
     {isSignedIn &&
         <Button.Group>
            <Button secondary
            >Department Activity Reservation</Button>
            <Button.Or />
            <Button positive onClick={handleNonDepartmentReservationClick}>Non Department Reservation</Button>
        </Button.Group>
    }
    </Segment> 
        )
    })

