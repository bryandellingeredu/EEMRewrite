import { Divider, Header, Icon, Message, Table } from "semantic-ui-react";
import {useEffect, useState} from 'react';
import { Activity } from "../../../app/models/activity";
import agent from "../../../app/api/agent";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { v4 as uuid } from "uuid";
import { useHistory } from 'react-router-dom'
import { format } from "date-fns";

export default function DeletedActivityTable(){
    const [loading, setLoading] = useState(true)
    const [deletedActivities, setDeletedActivities] = useState<Activity[]>([]);
    const history = useHistory();

    useEffect(() => {
        setLoading(true);
        agent.Activities.listDeleted()
            .then((response) => {
                setDeletedActivities(response);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            })
    }, []);

    return(
        <>
        <Divider horizontal>
        <Header as='h2'>
        <Icon name='recycle'  />
           Recycle Bin / Deleted Events
        </Header>
        </Divider>

        {loading &&
        <LoadingComponent content="Loading Deleted Items..." />
        }

        {!loading && (!deletedActivities || deletedActivities.length < 1) &&
           <Message warning>
           <Message.Header>No Data Found</Message.Header>
           <p>There are no deleted activities</p>
         </Message>
        }

        {!loading && deletedActivities && deletedActivities.length > 0 && 
           <Table celled selectable>
              <Table.Row>
        <Table.HeaderCell>Title</Table.HeaderCell>
        <Table.HeaderCell>Start</Table.HeaderCell>
        <Table.HeaderCell>End</Table.HeaderCell>
        <Table.HeaderCell>Action Officer</Table.HeaderCell>
        <Table.HeaderCell>Lead Org</Table.HeaderCell>
        <Table.HeaderCell>Sub Calendar</Table.HeaderCell>
        <Table.HeaderCell>Deleted By</Table.HeaderCell>
        <Table.HeaderCell>Deleted At</Table.HeaderCell>
      </Table.Row>
      <Table.Body>
    {deletedActivities.map(item => (
          <Table.Row key={uuid()}  onClick={() => history.push(`${process.env.PUBLIC_URL}/activities/${item.id}/${item.categoryId}`)}>
               <Table.Cell>{item.title}</Table.Cell>
               <Table.Cell>{item.allDayEvent? format(new Date(item.start), 'MM/dd/yy') : format(new Date(item.start), 'MM/dd/yy h:mm a')}</Table.Cell>
               <Table.Cell>{item.allDayEvent? format(new Date(item.end), 'MM/dd/yy') : format(new Date(item.end), 'MM/dd/yy h:mm a')}</Table.Cell>
               <Table.Cell>{item.actionOfficer}</Table.Cell>
               <Table.Cell>{item.organization?.name}</Table.Cell>
               <Table.Cell>{item.category.name}</Table.Cell>
               <Table.Cell>{item.deletedBy}</Table.Cell>
               <Table.Cell>{format(new Date(item.deletedAt as Date), 'MM/dd/yy h:mm a')}</Table.Cell>
          </Table.Row>
        ))}
    </Table.Body>
           </Table>
        }
 
     </>
    )

}