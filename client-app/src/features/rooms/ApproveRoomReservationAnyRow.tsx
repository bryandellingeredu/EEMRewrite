import { useState } from 'react';
import { Button, Table } from "semantic-ui-react";
import { format } from 'date-fns-tz';

interface Props {
    index: number,
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    webLink: string;
    roomName: string;
  }

  export default function ApproveRoomReservationAnyRow({ index, title, start, end, allDay, webLink, roomName }: Props) {
    const [showRow, setShowRow] = useState(true);
    const handleClick = () => {
        window.open(webLink, '_blank', 'noopener,noreferrer');
        setShowRow(false);
      };
      if (!showRow) return null;
      return (
        <Table.Row key={index}>
          <Table.Cell>{roomName}</Table.Cell>
          <Table.Cell>{title}</Table.Cell>
          <Table.Cell>{allDay ? format(new Date(start), 'MM/dd/yyyy') : format(new Date(start), 'MM/dd/yyyy hh:mm a')}</Table.Cell>
          <Table.Cell>{allDay ? format(new Date(end), 'MM/dd/yyyy') : format(new Date(end), 'MM/dd/yyyy hh:mm a')}</Table.Cell>
          <Table.Cell>
            {webLink && webLink.length > 0 &&
              <Button basic primary onClick={handleClick}>
                Approve / Disapprove Room Reservation in Outlook
              </Button>
            }
          </Table.Cell>
        </Table.Row>
      );
    }