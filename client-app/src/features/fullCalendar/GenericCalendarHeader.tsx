import { Divider, Header, Icon } from "semantic-ui-react";
import { faChurch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
    id: string
}

export default function GenericCalendarHeader({id} : Props){
    return(
    <Divider horizontal>
    <Header as='h2'>
      {id === 'csl' &&
        <>
          <Icon name='copyright'  />
          CSL Calendar
        </>
      }
      {id === 'asep' &&
        <>
          <Icon name='adn' />
          ASEP Calendar
        </>
      }
      {id === 'chapel' &&
        <>
          <FontAwesomeIcon icon={faChurch} size='2x' style={{marginRight: '10px'}} />
          Chapel Calendar
        </>
      }
    </Header>
  </Divider>
    )
}