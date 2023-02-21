import { PureComponent } from 'react';
import { ActivityFormValues } from '../../app/models/activity';
import { Editor } from "react-draft-wysiwyg";
import { convertFromRaw, EditorState } from 'draft-js';
import { Grid, Header } from 'semantic-ui-react';
import { format } from 'date-fns';
import { HostingReport } from '../../app/models/hostingReport';

interface Props {
  activity: ActivityFormValues;
}

export class HostingReportComponentToPrint extends PureComponent<Props> {
  state = {
    editorState: EditorState.createEmpty()
  };

  componentDidMount() {
    const { activity } = this.props;

    if (activity.hostingReport?.guestItinerary) {
      this.setState({
        editorState: EditorState.createWithContent(
          convertFromRaw(
            JSON.parse(activity.hostingReport!.guestItinerary)
          )
        )
      });
    } else {
      this.setState({
        editorState: EditorState.createEmpty()
      });
    }
  }

  render() {
    const { editorState } = this.state;
    const { activity } = this.props;
    const { hostingReport } = this.props.activity
    return (
        <div>
        <h2 style={{textAlign: 'center'}}> {activity.report} for {activity.title}</h2>


        <Grid  divided>
    <Grid.Row columns={3}>
      <Grid.Column>
        <Header as={'h4'} content={'Event Title:'} />
        {activity.title}
      </Grid.Column>
      <Grid.Column>
      <Header as={'h4'} content={'Start:'} />

        {activity.allDayEvent ? format(activity.start, 'MMMM d, yyyy') : format(activity.start, 'MMMM d, yyyy h:mm aa')}
      </Grid.Column>
      <Grid.Column>
      <Header as={'h4'} content={'End:'} />
      {activity.allDayEvent ? format(activity.end, 'MMMM d, yyyy') : format(activity.end, 'MMMM d, yyyy h:mm aa')}
      </Grid.Column>
    </Grid.Row>
    {hostingReport && hostingReport.purposeOfVisit && 
    <Grid.Row columns={1}>
      <Grid.Column>
      <Header as={'h4'} content={'Purpose of Visit / Visit Objectives:'} />
        {hostingReport.purposeOfVisit}
      </Grid.Column>
    </Grid.Row>
    }
    {activity.report === 'Hosting Report' && hostingReport && (hostingReport.escortOfficer || hostingReport.escortOfficerPhone) &&
    <Grid.Row columns={2}>
    <Grid.Column>
    <Header as={'h4'} content={'Escort Officer:'} />
      {hostingReport.escortOfficer}
    </Grid.Column>
    <Grid.Column>
    <Header as={'h4'} content={'Escort Officer Phone:'} />
      {hostingReport.escortOfficerPhone}
    </Grid.Column>
  </Grid.Row>
  }
    {activity.report === 'Hosting Report' && hostingReport && (hostingReport.guestRank  || hostingReport.guestOfficePhone ||  hostingReport.guestName) &&
    <Grid.Row columns={3}>
    <Grid.Column>
    <Header as={'h4'} content={'Visitor Rank / Honorific:'} />
      {hostingReport.guestRank}
    </Grid.Column>
    <Grid.Column>
    <Header as={'h4'} content={'Visitor Full Name:'} />
      {hostingReport.guestName}
    </Grid.Column>
    <Grid.Column>
    <Header as={'h4'} content={'Visitor Phone:'} />
      {hostingReport.guestOfficePhone }
    </Grid.Column>
  </Grid.Row>
  }
  {activity.report === 'Hosting Report' && hostingReport && (hostingReport.guestTitle || hostingReport.uniformOfGuest)  &&
    <Grid.Row columns={2}>
    <Grid.Column>
    <Header as={'h4'} content={'Visitor Title / Org:'} />
      {hostingReport.guestTitle}
    </Grid.Column>
    <Grid.Column>
    <Header as={'h4'} content={'Uniform of Visitor:'} />
      {hostingReport.uniformOfGuest}
    </Grid.Column>
  </Grid.Row>
  }
    {activity.report === 'Hosting Report' && hostingReport && (hostingReport.arrival  || hostingReport.departure ||  hostingReport.modeOfTravel) &&
    <Grid.Row columns={3}>
    <Grid.Column>
    <Header as={'h4'} content={'Date / Time of Arrival:'} />
         {hostingReport.arrival && format(hostingReport.arrival, 'MMMM d, yyyy h:mm aa')}
    </Grid.Column>
    <Grid.Column>
    <Header as={'h4'} content={'Date / Time of Departure:'} />
    {hostingReport.departure && format(hostingReport.departure, 'MMMM d, yyyy h:mm aa')}
    </Grid.Column>
    <Grid.Column>
    <Header as={'h4'} content={'Mode of Travel:'} />
      {hostingReport.modeOfTravel }
    </Grid.Column>
  </Grid.Row>
  }
       {activity.report === 'Hosting Report' && hostingReport && hostingReport.travelPartyAccomaniedBy && 
    <Grid.Row columns={1}>
      <Grid.Column>
      <Header as={'h4'} content={'Travel Party / Accompanied by:'} />
        {hostingReport.travelPartyAccomaniedBy}
      </Grid.Column>
    </Grid.Row>
    }

     {activity.report === 'Hosting Report' && hostingReport && hostingReport.travelArrangementDetails && 
    <Grid.Row columns={1}>
      <Grid.Column>
      <Header as={'h4'} content={'Travel Arrangement Details:'} />
        {hostingReport.travelArrangementDetails}
      </Grid.Column>
    </Grid.Row>
    }
    {activity.report === 'Hosting Report' && hostingReport && (hostingReport.mealRequestLunch || hostingReport.mealRequestDinner || hostingReport.dietaryRestrictions) && 
    <Grid.Row columns={2}>
      <Grid.Column>
      <Header as={'h4'} content={'Meal Requests:'} />
        {hostingReport.mealRequestLunch && hostingReport.mealRequestDinner && 'Lunch and Dinner'}
        {hostingReport.mealRequestLunch && !hostingReport.mealRequestDinner && 'Lunch'}
        {!hostingReport.mealRequestLunch && hostingReport.mealRequestDinner && 'Dinner'}
      </Grid.Column>
      <Grid.Column>
      <Header as={'h4'} content={'Dietary Restrictions:'} />
        {hostingReport.dietaryRestrictions}
      </Grid.Column>
    </Grid.Row>
    }
    {activity.report === 'Hosting Report' && hostingReport && hostingReport.lodgingLocation && 
    <Grid.Row columns={1}>
      <Grid.Column>
      <Header as={'h4'} content={'Lodging Location:'} />
        {hostingReport.lodgingLocation}
      </Grid.Column>
    </Grid.Row>
    }

    {hostingReport && (hostingReport.parkingRequirements || hostingReport.parkingDetails) &&
    <Grid.Row columns={1}>
    <Grid.Column>
    <Header as={'h4'} content={'Parking Requirements:'} />
      {hostingReport.parkingRequirements && 'Parking is required. '}  {hostingReport.parkingDetails}
    </Grid.Column>
    </Grid.Row>
    }

  {activity.report === 'Hosting Report' && hostingReport && (hostingReport.flagSupport || hostingReport.flagDetails) && 
    <Grid.Row columns={1}>
      <Grid.Column>
      <Header as={'h4'} content={'Flag Support:'} />
        {hostingReport.flagSupport && 'Flag Support is needed. '}{hostingReport.flagDetails}
      </Grid.Column>
    </Grid.Row>
    }

{activity.report === 'Hosting Report' && hostingReport && hostingReport.gift && 
    <Grid.Row columns={1}>
      <Grid.Column>
      <Header as={'h4'} content={'Gift Requirement:'} />
        {hostingReport.gift}
      </Grid.Column>
    </Grid.Row>
    }

   {activity.report === 'Outsiders Report' && hostingReport && hostingReport.outsiderReportUSAWCGraduate &&
    <Grid.Row columns={1}>
    <Grid.Column>
    <Header as={'h4'} content={'USAWC Graduate: Enter Resident or DDEE and Year, e.g Res 2009, DDE 2008:'} />
      {hostingReport.outsiderReportUSAWCGraduate}
    </Grid.Column>
    </Grid.Row>
    }

{activity.report === 'Outsiders Report' && hostingReport && hostingReport.outsiderReportDirectorate &&
    <Grid.Row columns={1}>
    <Grid.Column>
    <Header as={'h4'} content={'Directorate:'} />
      {hostingReport.outsiderReportDirectorate}
    </Grid.Column>
    </Grid.Row>
  }
  
{activity.report === 'Outsiders Report' && hostingReport && hostingReport.outsiderReportDV   &&
    <Grid.Row columns={1}>
    <Grid.Column>
    <Header as={'h4'} content={'Visiting DV:'} />
      {hostingReport.outsiderReportDV}
    </Grid.Column>
    </Grid.Row>
  }

{activity.report === 'Outsiders Report' && hostingReport && hostingReport.outsiderReportNumOfPeople  &&
    <Grid.Row columns={1}>
    <Grid.Column>
    <Header as={'h4'} content={'Number of People:'} />
      {hostingReport.outsiderReportNumOfPeople}
    </Grid.Column>
    </Grid.Row>
  }



  </Grid>



     {/*
        <Editor
          editorState={editorState}
          toolbarClassName='hide-toolbar'
        />
    */}

      </div>
    );
  }
}