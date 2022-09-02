import { Button, Card, Image } from "semantic-ui-react";
import { Activity } from "../../../app/models/activity";

interface Props{
    activity: Activity;
    cancelSelectActivity: () => void;
    openForm: (id: string) => void;
}
export default function ActivityDetails(
    {activity, cancelSelectActivity, openForm}: Props) {
    return(
        <Card fluid>
        <Image src={`/assets/categoryImages/${activity.category}.jpg`}  />
        <Card.Content>
          <Card.Header>{activity.subject}</Card.Header>
          <Card.Meta>
            <span>
            {new Date(activity.start.dateTime)
                                    .toLocaleTimeString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                }
                                &nbsp; - &nbsp;

                                {

                                    new Date(activity.start.dateTime).toLocaleDateString() ===
                                        new Date(activity.end.dateTime).toLocaleDateString() ?
                                        new Date(activity.end.dateTime)
                                            .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        :
                                        new Date(activity.start.dateTime)
                                            .toLocaleTimeString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                }
            </span>
          </Card.Meta>
          <Card.Description>
            {activity.bodyPreview}
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
           <Button.Group widths='2'>
               <Button basic color='blue' content='Edit'
               onClick={() => openForm(activity.id)}
               />
               <Button basic color='grey' content='Cancel'
               onClick={cancelSelectActivity}
               />
           </Button.Group>
        </Card.Content>
      </Card>
    )
}