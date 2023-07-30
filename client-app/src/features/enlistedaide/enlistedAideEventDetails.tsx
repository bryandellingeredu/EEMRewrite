import { Button, Header, Segment, SegmentGroup } from "semantic-ui-react";
import { EnlistedAideMobileDetails } from "../../app/models/enlistedAideMobileDetails";
import { Link } from "react-router-dom";

interface Props {
    details: EnlistedAideMobileDetails
}

export default function EnlistedAideEventDetails({details} : Props) {
    return(
    <>
   
 
<SegmentGroup>
    <Segment>
    <Header textAlign="center">
    <Header.Content>
    {details.task}
    </Header.Content>
    <Header.Subheader>
      {details.duration}
    </Header.Subheader>
  </Header>
    </Segment>
    <Segment>
<Button fluid color='orange'  as={Link} to={`${process.env.PUBLIC_URL}/enlistedAideChecklistForm/${details.activityId}/${details.categoryId}`}>
                    Go To CheckList
</Button>
</Segment>
<Segment>
  <strong>Title:</strong> {details.title}
</Segment>
{details.enlistedAideVenue &&
<Segment>
  <strong>Venue:</strong> {details.enlistedAideVenue }
</Segment>
}
{details.enlistedAideFundingType &&
<Segment>
  <strong>Funding:</strong> {details.enlistedAideFundingType }
</Segment>
}
{details.enlistedAideGuestCount &&
<Segment>
  <strong>Guest Count:</strong> {details.enlistedAideGuestCount }
</Segment>
}
{details.enlistedAideCooking &&
<Segment>
  <strong>Cooking:</strong> {details.enlistedAideCooking }
</Segment>
}
{details.enlistedAideDietaryRestrictions &&
<Segment>
  <strong>Dietary Restrictions:</strong> {details.enlistedAideDietaryRestrictions }
</Segment>
}
{details.enlistedAideAlcohol &&
<Segment>
  <strong>Alocohol:</strong> {details.enlistedAideAlcohol }
</Segment>
}
{details.enlistedAideNumOfBartenders &&
<Segment>
  <strong>Num Of Bartenders:</strong> {details.enlistedAideNumOfBartenders }
</Segment>
}
{details.enlistedAideNumOfServers &&
<Segment>
  <strong>Num Of Servers:</strong> {details.enlistedAideNumOfServers }
</Segment>
}
{details.enlistedAideSupportNeeded &&
<Segment>
<strong>Additional Support:</strong> 
{details.enlistedAideSupportNeeded.length > 100 ? 
  `${details.enlistedAideSupportNeeded.substring(0, 100)}...` :
  details.enlistedAideSupportNeeded}
</Segment>
}

</SegmentGroup>
</>
    )
}
