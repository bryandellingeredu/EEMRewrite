import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Formik, Form, useFormikContext } from "formik";
import { toast } from "react-toastify";
import { Link, useHistory, useParams } from "react-router-dom";
import { useStore } from "../../../app/stores/store";
import { Button, Divider, Grid, Header, Icon,   Segment,   Form as SemanticForm, } from "semantic-ui-react";
import MySemanticCheckBox from "../../../app/common/form/MySemanticCheckbox";
import MySelectInput from "../../../app/common/form/MySelectInput";
import MyCheckBox from "../../../app/common/form/MyCheckBox";
import CUIWarningModal from "./CUIWarningModal";
import agent from "../../../app/api/agent";

interface ActivityCalendarInformationDTO{
    id: string
    title: string,
    communityEvent: boolean
    checkedForOpsec: boolean
    mfp: boolean
    imc: boolean
    copiedToacademic: boolean;
    copiedToasep: boolean;
    copiedTocommandGroup: boolean;
    copiedTocommunity: boolean;
    copiedTospouse: boolean;
    copiedTocsl: boolean;
    copiedTogarrison: boolean;
    copiedTointernationalfellows: boolean;
    copiedToexec: boolean;
    copiedTogeneralInterest: boolean;
    copiedToholiday: boolean;
    copiedTopksoi: boolean;
    copiedTosocialEventsAndCeremonies: boolean;
    copiedTossiAndUsawcPress: boolean;
    copiedTossl: boolean;
    copiedTotrainingAndMiscEvents: boolean;
    copiedTousahec: boolean;
    copiedTousahecFacilitiesUsage: boolean;
    copiedTovisitsAndTours: boolean;
    copiedTosymposiumAndConferences: boolean;
    copiedTobattlerhythm : boolean,
    copiedTostaff: boolean,
    copiedTostudentCalendar : boolean
    educationalCategory: string
}

export default observer(function AddToCalendars() {
    const [activityCalendarInformation, setActivityCalendarInformation] = useState<ActivityCalendarInformationDTO>(
        {id: '',
         title: '',
         communityEvent: false,
         checkedForOpsec: false,
         mfp: false,
         imc: false,
         copiedToacademic: false,
         copiedToasep: false,
         copiedTocommandGroup: false,
         copiedTocommunity: false,
         copiedTospouse: false,
         copiedTocsl: false,
         copiedTogarrison: false,
         copiedTointernationalfellows: false,
         copiedToexec: false,
         copiedTogeneralInterest: false,
         copiedToholiday: false,
         copiedTopksoi: false,
         copiedTosocialEventsAndCeremonies: false,
         copiedTossiAndUsawcPress: false,
         copiedTossl: false,
         copiedTotrainingAndMiscEvents: false,
         copiedTousahec: false,
         copiedTousahecFacilitiesUsage: false,
         copiedTovisitsAndTours: false,
         copiedTosymposiumAndConferences: false,
         copiedTobattlerhythm : false,
         copiedTostaff: false,
         copiedTostudentCalendar : false,
         educationalCategory: ''
        }
      );
      const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { id } = useParams<{ id: string }>();
    const { categoryId } = useParams<{ categoryId: string }>();
    const {categoryStore, activityStore, modalStore} = useStore();
    const { categoryOptions, categories, loadCategories } = categoryStore;
    const {loadActivity} = activityStore
    const {openModal, closeModal} = modalStore;
    const [cuiWarningHasBeenDisplayed, setCUIWarningHasBeenDisplayed] = useState(false);

    const handleCUIWarningHasBeenDisplayed = () => {
        closeModal();
        setCUIWarningHasBeenDisplayed(true);
      }

    useEffect(() => {
        if(!categories || categories.length < 1) loadCategories();
        loadActivity(id, categoryId).then((response) => {
          if(response){
            const loadedActivityCalendarInformation : ActivityCalendarInformationDTO = {
                id: response.id,
                title: response.title,
                communityEvent: response. communityEvent,
                checkedForOpsec: response.checkedForOpsec,
                mfp: response.mfp,
                imc: response.imc,
                copiedToacademic: response.copiedToacademic,
                copiedToasep: response.copiedToasep,
                copiedTocommandGroup: response.copiedTocommandGroup,
                copiedTocommunity: response.copiedTocommunity,
                copiedTospouse: response.copiedTospouse,
                copiedTocsl: response.copiedTocsl,
                copiedTogarrison: response.copiedTogarrison,
                copiedTointernationalfellows: response.copiedTointernationalfellows,
                copiedToexec: response.copiedToexec,
                copiedTogeneralInterest: response.copiedTogeneralInterest,
                copiedToholiday: response.copiedToholiday,
                copiedTopksoi: response.copiedToholiday,
                copiedTosocialEventsAndCeremonies: response.copiedTosocialEventsAndCeremonies,
                copiedTossiAndUsawcPress: response.copiedTossiAndUsawcPress,
                copiedTossl: response.copiedTossl,
                copiedTotrainingAndMiscEvents: response.copiedTotrainingAndMiscEvents,
                copiedTousahec: response.copiedTousahec,
                copiedTousahecFacilitiesUsage: response.copiedTousahecFacilitiesUsage,
                copiedTovisitsAndTours: response.copiedTousahecFacilitiesUsage,
                copiedTosymposiumAndConferences: response.copiedTosymposiumAndConferences,
                copiedTobattlerhythm : response.copiedTobattlerhythm,
                copiedTostaff: response.copiedTostaff,
                copiedTostudentCalendar : response.copiedTostudentCalendar,
                educationalCategory: response.educationalCategory
            }
            setActivityCalendarInformation(loadedActivityCalendarInformation);
          }
          setLoading(false);
        });
    },[])

    function handleFormSubmit(values: ActivityCalendarInformationDTO) {
        setSubmitting(true);
        agent.AddToEEMCalendars.update(values,id)
            .then(() => {
                history.push(
                  `${process.env.PUBLIC_URL}/activities/${id}/${categoryId}`
                );
              })
              .catch((error) => {
                console.log(error);
                toast.error('An error occurred while adding to calendars activity');
              });
    }
    
    return (
        <>
        {loading || categories.length < 1 &&
            <LoadingComponent content="loading data" />
        }
        {!loading && categories.length > 0 &&
        <>
               <Divider horizontal>
               <Header as='h2'>
               <Icon name='calendar'  />
                  Add {activityCalendarInformation.title} to EEM Calendars
               </Header>
          
               </Divider>
                    <Header as='h3' textAlign="center">    
                        Sub Calendar: {categories.find(x => x.id === categoryId)?.name}
                   </Header>
                   <Formik initialValues={activityCalendarInformation}
                           onSubmit={(values: ActivityCalendarInformationDTO) => handleFormSubmit(values)}>
                            {({ handleSubmit, values }) => (
                            <Form className="ui form" onSubmit={handleSubmit} autoComplete="off">
                                 <Segment color='red'>
                                <Grid>
                                   <Grid.Row>
                                   <Grid.Column width={4}>
                                   </Grid.Column>
                                    <Grid.Column width={12}>
                                        <SemanticForm.Group inline>
                                            <MySemanticCheckBox
                                             name="imc"
                                            label="Integrated Master Calendar (IMC)"
                                        />
                        </SemanticForm.Group>
                      </Grid.Column>
                                   </Grid.Row>
                                </Grid>
                    </Segment>
                    <Segment color='blue'>
                                <Grid>
                                   <Grid.Row>
                                   <Grid.Column width={4}>
                                   </Grid.Column>
                                    <Grid.Column width={12}>



                                        <SemanticForm.Group inline>
                                            <MySemanticCheckBox
                                             name="copiedTobattlerhythm"
                                             label="Battle Rhythm"
                                             disabled={categories.find(x => x.id === categoryId)?.routeName === "battlerhythm"}
                                        />

                           <MySemanticCheckBox
                            name="copiedToacademic"
                            label="Faculty Calendar"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "academic"}
                          />

                         <MySemanticCheckBox
                            name="copiedToasep"
                            label="ASEP Calendar"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "asep"}
                          />

                         <MySemanticCheckBox
                               name="copiedTocommandGroup"
                               label="Command Group Calendar"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "commandGroup"}
                          />

                           <MySemanticCheckBox
                                  name="copiedTocsl"
                                  label="CSL Calendar"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "csl"}
                          />

                          <MySemanticCheckBox
                                   name="copiedTogarrison"
                                   label="Garrison Calendar"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "garrison"}
                          />

                           <MySemanticCheckBox
                                   name="copiedTointernationalfellows"
                                   label="International Fellows"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "internationalfellows"}
                          />

                              <MySemanticCheckBox
                                   name="copiedToexec"
                                   label="Executive Services Calendar"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "exec"}
                          />

                          


                        </SemanticForm.Group>
                      </Grid.Column>
                                   </Grid.Row>
                                </Grid>
                    </Segment>




                    <Segment color='green'>
                                <Grid>
                                   <Grid.Row>
                                   <Grid.Column width={4}>
                                   </Grid.Column>
                                    <Grid.Column width={12}>



                                        <SemanticForm.Group inline>
                                            <MySemanticCheckBox
                                              name="copiedTogeneralInterest"
                                              label="General Interest"
                                             disabled={categories.find(x => x.id === categoryId)?.routeName === "generalInterest"}
                                        />

                           <MySemanticCheckBox
                                   name="copiedToholiday"
                                   label="Holiday Calendar"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "holiday"}
                          />

                         <MySemanticCheckBox
                                name="copiedTossl"
                                label="SSL Admin Calendar"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "ssl"}
                          />

                         <MySemanticCheckBox
                                    name="copiedTopksoi"
                                    label="PKSOI Calendar"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "pksoi"}
                          />

                           <MySemanticCheckBox
                               name="copiedTosocialEventsAndCeremonies"
                               label="Social Events And Ceremonies"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "socialEventsAndCeremonies"}
                          />

                          <MySemanticCheckBox
                                     name="copiedTotrainingAndMiscEvents"
                                     label="Training"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "trainingAndMiscEvents"}
                          />


                        </SemanticForm.Group>
                      </Grid.Column>
                                   </Grid.Row>
                                </Grid>
                    </Segment>

                    <Segment color='brown'>
                                <Grid>
                                   <Grid.Row>
                                   <Grid.Column width={4}>
                                   </Grid.Column>
                                    <Grid.Column width={12}>



                                        <SemanticForm.Group inline>
                                            <MySemanticCheckBox
                                              name="copiedTossiAndUsawcPress"
                                              label="SSI And USAWC Press Calendar"
                                             disabled={categories.find(x => x.id === categoryId)?.routeName === "ssiAndUsawcPress"}
                                        />

                           <MySemanticCheckBox
                                    name="copiedTousahec"
                                    label="USAHEC Calendar"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "usahec"}
                          />

                         <MySemanticCheckBox
                                   name="copiedTousahecFacilitiesUsage"
                                   label="USAHEC Facilities Usage Calendar"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "usahecFacilitiesUsage"}
                          />

                         <MySemanticCheckBox
                                        name="copiedTovisitsAndTours"
                                        label="Visits And Tours"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "visitsAndTours"}
                          />

                           <MySemanticCheckBox
                                 name="copiedTostudentCalendar"
                                 label="Student Calendar"
                            disabled={true}
                          />

                        </SemanticForm.Group>
                      </Grid.Column>
                                   </Grid.Row>
                                </Grid>
                    </Segment>

                    <Segment color='green'>
                                <Grid>
                                   <Grid.Row>
                                   <Grid.Column width={4}>
                                   </Grid.Column>
                                    <Grid.Column width={12}>



                                        <SemanticForm.Group inline>
                                            <MySemanticCheckBox
                                              name="copiedTogeneralInterest"
                                              label="General Interest"
                                             disabled={categories.find(x => x.id === categoryId)?.routeName === "generalInterest"}
                                        />

                           <MySemanticCheckBox
                                   name="copiedToholiday"
                                   label="Holiday Calendar"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "holiday"}
                          />

                         <MySemanticCheckBox
                                name="copiedTossl"
                                label="SSL Admin Calendar"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "ssl"}
                          />

                         <MySemanticCheckBox
                                    name="copiedTopksoi"
                                    label="PKSOI Calendar"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "pksoi"}
                          />

                           <MySemanticCheckBox
                               name="copiedTosocialEventsAndCeremonies"
                               label="Social Events And Ceremonies"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "socialEventsAndCeremonies"}
                          />

                          <MySemanticCheckBox
                                     name="copiedTotrainingAndMiscEvents"
                                     label="Training"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "trainingAndMiscEvents"}
                          />


                        </SemanticForm.Group>
                      </Grid.Column>
                                   </Grid.Row>
                                </Grid>
                    </Segment>

                    <Segment color='orange'>
                                <Grid>
                                   <Grid.Row>
                                   <Grid.Column width={4}>
                                   </Grid.Column>
                                    <Grid.Column width={12}>



                                        <SemanticForm.Group inline>
                                            <MySemanticCheckBox
                                                 name="mfp"
                                                 label="Military Family and Spouse Program"
                                             disabled={categories.find(x => x.id === categoryId)?.routeName === "militaryFamilyAndSpouseProgram"}
                                        />

                                 <MySemanticCheckBox
                                     name="copiedTospouse"
                                     label="Spouse"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "spouse"}
                          />

                           <MySemanticCheckBox
                                     name="copiedTocommunity"
                                     label="Community Event (External)"
                            disabled={categories.find(x => x.id === categoryId)?.routeName === "community"}
                          />
                           
                           {(values.mfp || categories.find(x => x.id === categoryId)?.routeName === "community")
              && (
              <MySelectInput
                options={[
                  { text: "No Color", value: "" },
                  {
                    text: "Leadership & Readiness",
                    value: "Leadership & Readiness",
                  },
                  {
                    text: "Personal Finance Management",
                    value: "Personal Finance Management",
                  },
                  {
                    text: "Personal Growth and Fitness",
                    value: "Personal Growth and Fitness",
                  },
                  {
                    text: "Family Growth & Resiliency",
                    value: "Family Growth & Resiliency",
                  },
                  { text: "TS-SCI", value: "TS-SCI" },
                ]}
                placeholder="No Color"
                name="educationalCategory"
                label="Educational Category for MFSP:"
              />
            )}
      

                        </SemanticForm.Group>
                      </Grid.Column>
                                   </Grid.Row>
                                </Grid>
                    </Segment>

                    {( values.mfp || values.copiedTocommunity ) && (
              <Segment inverted color="red">
                <Header as={'h2'} content='You have selected Community Event and / or Military Spouse and Family Program so you must review the event details for OPSEC and PII. check box below when complete'/>
                <MyCheckBox
                  name="checkedForOpsec"
                />
                    <Button icon inverted  
                    type="button"
                    onClick={() =>
                      openModal(
                        <CUIWarningModal handleCUIWarningHasBeenDisplayed={handleCUIWarningHasBeenDisplayed} showHeader={false} cuiButtonClicked={true} opsecButtonClicked={false}/>, 'large'
                      )
                    }
                    >
                      Show More Information about CUI
                    </Button>
                    <Button icon inverted 
                    type="button"
                    onClick={() =>
                      openModal(
                        <CUIWarningModal handleCUIWarningHasBeenDisplayed={handleCUIWarningHasBeenDisplayed} showHeader={false} cuiButtonClicked={false} opsecButtonClicked={true}/>, 'large'
                      )
                    }
                    >
                      Show OPSEC Guidelines for USAWC Calendar Addition
                    </Button>
              </Segment>
            )}
  <Button
              disabled={( values.mfp || values.copiedTocommunity ) && !values.checkedForOpsec}
              size='massive'
              loading={submitting}
              floated="right"
              positive
              type="submit"
              content="Submit"
            />
            <Button
              as={Link}
              to={ `${process.env.PUBLIC_URL}/manage/${id}/${categoryId}`}
              floated="right"
              type="button"
              content="Cancel"
              size='massive'
            />
                            </Form>
                    )}
                </Formik>  
             </>
        }
        </>
    )
})