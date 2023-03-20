
import { Button, Divider, Grid, Header, Icon, Segment, SegmentGroup } from "semantic-ui-react";
import {useState} from 'react';


interface Props{
    handleCUIWarningHasBeenDisplayed: () => void
}


export default function CUIWarningModal({handleCUIWarningHasBeenDisplayed} : Props){
    const [showCUIInfo, setShowCUIInfo] = useState(false);
    const [showGuidelines, setShowGuidelines] = useState(false);
    return (
      <>
          <Divider horizontal>
            <Header as="h2">
                <Icon name='warning' color='yellow' />     
              You have selected this event to be displayed on a public calendar.
            </Header>
          </Divider>
    
          <SegmentGroup>
            <Segment>
                <h3>
                 Everything you type in the 'Event Details' will be available for the public to read. PLEASE take the time to review what is in your event details.
                 DO NOT post info in the Event Details that contains OPSEC sensitive info or PII (e.g. Itinerary of General Officers, personal phone numbers, information personal in nature).
                 </h3>
            </Segment>
            <Segment>
           <h3> Operations Security (OPSEC) is a process of identifying critical information and subsequently analyzing friendly actions attendant to military operations.
            Determine indicators that hostile intelligence systems might obtain that could be interpreted or pieced together to derive critical information in time to be useful to adversaries.
            Select and execute measures that eliminate or reduce to an acceptable level the vulnerabilities of friendly actions to adversary exploitation.</h3>
            </Segment>
            <Segment>
            <h3>
            PII is information that can be used to distinguish or trace someone's identity.
            It includes information such as social security number, age, military rank or civilian grade, home and office numbers, birthdays, spouse name, marital status, educational history and medical records.
            </h3>
            </Segment>
            <Segment>
            <h3>
            You MUST check the 'Checked For OPSEC' checkbox also or you will not be able to save the event.
            </h3>
            </Segment>
            <Segment>
                {!showCUIInfo && 
                <Button basic color='blue' onClick={() => setShowCUIInfo(true)}>Show More Information About CUI </Button>
               }
              { showCUIInfo && 
                <Button basic color='blue' onClick={() => setShowCUIInfo(false)}>Show Less Information About CUI </Button>
               }
              {!showGuidelines && 
                <Button basic color='blue' onClick={() => setShowGuidelines(true)}>Show OPSEC Guidelines for USAWC Calendar Addition </Button>
               }
              { showGuidelines && 
                <Button basic color='blue' onClick={() => setShowGuidelines(false)}>Hide OPSEC Guidelines for USAWC Calendar Addition </Button>
               }
            </Segment>
         </SegmentGroup>
       
       { showCUIInfo && 
       <SegmentGroup>
            <Segment>
               <Header as={'h1'} textAlign='center' content = 'Controlled Unclassified Information (CUI) Event' />            
            </Segment>
            <Segment>
            Government created or owned UNCLASSIFIED information that must be safeguarded from unauthorized disclosure.
 An overarching term representing many difference categories, each authorized by one or more law, regulation, or Government-wide policy.
 Information requiring specific security measures indexed under one system across the Federal Gov't
            </Segment>
            <Segment>
               <Header as={'h3'} textAlign='center' content='Personally Identiifiable Information (PII)'/>
               Uses data to confirm an individual's identity.
            Sensitive personally identifiable information can include your full name, address, telephone #, email address, Social Security Number,
             driver's license, financial information or credit card number, Department of Defense Identification (ID) number, and medical records.
             What is not an example of PII? Info such as business phone numbers and race, religion, gender, workplace, and job titles
            are typically not considered PII.
            </Segment>
            <Segment>
               <Header as={'h3'} textAlign='center' content='Sensitive Personally Identifiable Information (SPII)'/>
               <ol>
                <li>A subset of PII that, if lost, compromised, or disclosed without authorization could result in substantial harm, embarrassment, inconvenience, or unfairness to an individual. Some forms of PII are sensitive as stand-alone elements.</li>
                <li> Examples of stand-alone PII include Social Security Numbers (SSN), driver's license or state identification number; Alien Registration Numbers; financial account number; and biometric identifiers such as fingerprint, voiceprint, or iris scan.</li>
                <li>
                Additional examples of SPII include any groupings of information that contain an individual's name or other unique identifier plus one or more of the following elements:
                  <ol>
                    <li>Truncated SSN (such as last four digits)</li>
                    <li>Date of birth (month, day, and year)</li>
                    <li>Citizenship or immigration status</li>
                    <li>Ethnic or religious affiliation</li>
                    <li>Sexual orientation</li>
                    <li>Criminal history</li>
                    <li>Medical information</li>
                    <li>Medical information</li>
                    <li>System authentication information such as mother's maiden name, account passwords, or personal identification numbers</li>
                  </ol>
                </li>
               </ol>
            </Segment>
            <Segment>
            <Header as={'h3'} textAlign='center' content='Unclassified Controlled Technical Information (UCTI)'/>
            </Segment>
            <Segment>
            <Header as={'h3'} textAlign='center' content='Sensitive but Unclassified (SBU)'/>
            is a designation of information in the United States federal government that, though unclassified, often requires strict controls
            over its distribution. SBU is a broad category of information that includes material covered by such designations as
            For Official Use Only (FOUO), Law Enforcement Sensitive (LES), Sensitive Homeland Security Information, Sensitive Security Information (SSI),
            Critical Infrastructure Information (CII), etc.
            </Segment>
            <Segment>
            <Header as={'h3'} textAlign='center' content='For Official Use Only (FOUO)'/>
             Department of Defense recently released changed from "For Official Use Only" labeling to "Controlled Unclassified Information.""
            </Segment>
            <Segment>
            <Header as={'h3'} textAlign='center' content='Law Enforcement Sensitive (LES), and others.'/>
            </Segment>
       </SegmentGroup>
       }

{ showGuidelines && 
  <SegmentGroup>
      <Segment>
               <Header as={'h1'} textAlign='center' content = 'OPSEC Guidelines for USAWC Calendar Addition' />            
        </Segment>
        <Segment>
        <Header as={'h3'} textAlign='center'>
        <Header.Content>
        IAW THE USAWC Critical Information List (CIL)
        </Header.Content>
            <Header.Subheader>
            The following information pertaining to visitors should be protected and not released to the public
            </Header.Subheader>
        </Header>
        <ol>
            <li>
            Sensitive non-public major USAWC and Carlisle Barracks events, times, locations, attendees, and security plans. This includes, but I not limited to:
            <ol>
                <li>Ongoing Operations.</li>
                <li>Higher Headquarters COOP exercises.</li>
                <li>Contingency Planning Meetings/working groups for real world operations</li>
            </ol> 
            </li>
            <li>Itineraries of general officers, senior executive service officials, very important persons, and distinguished visitors (High Risk Personnel (HRP)).</li>
        </ol>
        </Segment>
        <Segment>
        <Header as={'h3'} textAlign='center'>
            <Header.Content>
            Visitor and guest events
            </Header.Content>
            <Header.Subheader>
            Visitor and guest events can be added to the IMC as it is protected on the NIPR portal, however, if it contains any CIL or Controlled Unclassified Information, it should not be shared on any other calendar or portal which allows public, non-security enabled access.
            </Header.Subheader>
        </Header>
        </Segment>
        <Segment>
        <Header as={'h3'} textAlign='center'>
            <Header.Content>
            In general, visitor and speaker engagements are NOT CUI 
            </Header.Content>
            <Header.Subheader>
            In general, visitor and speaker engagements are NOT CUI and can be included on the IMC and academic calendars if it enhances situational awareness and synchronization across the enterprise. This includes, but is not limited to: 
            </Header.Subheader>
        </Header>
        <ol>
            <li>
            USG/DoD/Army Staff visits that include speaking to the student body. 
            </li>
            <li>
            Special guest speakers and engagements.  
            </li>
        </ol>
        </Segment>
        <Segment>
        <Header as={'h3'} textAlign='center'>
            <Header.Content>
            The following information MUST, however, be protected  
            </Header.Content>
            <Header.Subheader>
            The following information MUST, however, be protected (marked as CUI and not shared on calendars or SharePoint).  
            </Header.Subheader>
        </Header>
        <ol>
            <li>
            Detailed Itineraries of VIP/DV/HRPs (mode of transportation, arrival/departure times, etc.).  
            </li>
            <li>
            Accommodation details.   
            </li>
            <li>
            Security Measures or plans in place for events/engagements. 
            </li>
        </ol>
        </Segment>
        <Segment>
        <Header as={'h3'} textAlign='center'>
            <Header.Content>
            References 
            </Header.Content>
        </Header>
        <ol>
            <li>
            Department of Defense Directive 5205.02E, DoD Operations Security (OPSEC) Program, 20 June 2012.   
            </li>
            <li>
            Department of Defense Manual 5205.02-M, DoD Operations Security (OPSEC) Program Manual, 3 November 2008.   
            </li>
            <li>
            Joint Publication 3-13.3, Operations Security, 06 January 2016.  
            </li>
            <li>
            Army Regulation 530-1, Operations Security, 26 September 2014.   
            </li>
            <li>
            USAWC OPSEC Plan, 16 Jan 2018.    
            </li>
            <li>
            USAWC Policy Memorandum #18, Operations Security (OPSEC), 31 Jan 2021.     
            </li>
        </ol>
        </Segment>
        <Segment>
        <Header as={'h3'} textAlign='center'>
            <Header.Content>
            POC is Mr. Judd Sweitzer
            </Header.Content>
            <Header.Subheader>
            POC is Mr. Judd Sweitzer, USAWC OPSEC Officer, judd.r.sweitzer.civ@mail.mil, 717-245-4151.
            </Header.Subheader>
        </Header>
        </Segment>
  </SegmentGroup>
}


         <Button
            floated="right" primary
            onClick={handleCUIWarningHasBeenDisplayed}
          >
            OK
          </Button>

          <Divider/>

          </>
          )
        }