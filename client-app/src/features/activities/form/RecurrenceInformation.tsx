import { observer } from "mobx-react-lite";
import { Divider, Grid, Header, Icon, Form as SemanticForm, Button} from "semantic-ui-react";
import { RecurrenceOptions, RecurrenceOptionsFormValues } from "../../../app/models/recurrenceOptions";
import { Formik, Form, yupToFormErrors } from "formik";
import MySemanticRadioButton from "../../../app/common/form/MySemanticRadioButton";
import MySemanticCheckBox from "../../../app/common/form/MySemanticCheckbox";
import MyDateInput from "../../../app/common/form/MyDateInput";
import * as Yup from 'yup';
import { useStore } from "../../../app/stores/store";

interface Props{
    recurrenceOptions: RecurrenceOptions
    setRecurrenceOptions: (recurrenceOptions: RecurrenceOptions) => void
    setRecurrence: (recurrence: boolean) => void
  }

export default observer(function RecurrenceInformation({recurrenceOptions, setRecurrenceOptions, setRecurrence }: Props) {

  const {modalStore} = useStore();


  const validationSchema = Yup.object({
    intervalEnd: Yup.string().required('Enter a date when the iteration should end').nullable(),
    intervalStart: Yup.string().required('Enter a date when the iteration should begin').nullable()
    .test('startBeforeEnd', 'Start must be before End', function(){
     return true
    }),
    monday: Yup.boolean(),
    tuesday: Yup.boolean(),
    wednesday: Yup.boolean(),
    thursday: Yup.boolean(),
    friday: Yup.boolean(),
    saturday: Yup.boolean(),
    interval: Yup.string(),
    sunday: Yup.boolean().test('oneOfRequired', 'pick day/s', function(){
      return (this.parent.sunday || this.parent.monday || this.parent.tuesday || this.parent.wednesday || this.parent.thursday || this.parent.friday || this.parent.saturday || this.parent.interval === 'monthlyByDate')
    })
  })

    function handleFormSubmit(recurrenceOptions: RecurrenceOptionsFormValues) {
      console.log(recurrenceOptions);
      setRecurrenceOptions(recurrenceOptions);
      setRecurrence(true);
      modalStore.closeModal();      
    }
    let numOfDays = 10;
    return(
        <>
         <Button  floated='right' icon   size='mini' color='black' compact onClick={() => modalStore.closeModal()} >
         <Icon name='close'/>
         </Button>
        <Header as='h2'>
        <Icon name='repeat' />
        <Header.Content>
          Repeat
          <Header.Subheader>Set your preferences</Header.Subheader>
        </Header.Content>
      </Header>
      <Divider/>

      <Formik enableReinitialize
        initialValues={recurrenceOptions}
        validationSchema={validationSchema}
        onSubmit={values => handleFormSubmit(values)}>       
        {({ handleSubmit, isSubmitting, values, isValid, dirty }) => (
               <Form className='ui form' onSubmit={handleSubmit} autoComplete='off' style={{paddingBottom: '20px'}}>
                 <Grid>
                 <Grid.Column width={3}>
                    <strong>*Interval:</strong>
                </Grid.Column>
                <Grid.Column width={13}>
                <SemanticForm.Group inline>
                   <MySemanticRadioButton label="Weekly" value='weekly' name='interval'/>
                   <MySemanticRadioButton label="Bi Weekly" value='biweekly' name='interval'/>
                   <MySemanticRadioButton label="Monthly By Date" value='monthlyByDate' name='interval'/>
                   <MySemanticRadioButton label="Monthly By Weekday" value='monthlyByWeekDay' name='interval'/>
                </SemanticForm.Group>
                </Grid.Column>
                </Grid>
                {values.interval !== 'monthlyByDate' &&          
                 <Grid>
                 <Grid.Column width={3}>
                    <strong>*Days:</strong>
                </Grid.Column>
                <Grid.Column width={13}>
                <SemanticForm.Group inline>
                    <MySemanticCheckBox label="Sunday" name="sunday"/>
                    <MySemanticCheckBox label="Monday" name="monday"/>
                    <MySemanticCheckBox label="Tuesday" name="tuesday"/>
                    <MySemanticCheckBox label="Wednesday" name="wednesday"/>
                    <MySemanticCheckBox label="Thursday" name="thursday"/>
                    <MySemanticCheckBox label="Friday" name="friday"/>
                    <MySemanticCheckBox label="Saturday" name="saturday"/>
                </SemanticForm.Group>
                </Grid.Column>
                 </Grid>
                }
                {values.interval === 'monthlyByDate' &&   
                <>    
                 <Grid>
                 <Grid.Column width={3}>
                    <strong>*Day Of Month:</strong>
                </Grid.Column>
                <Grid.Column width={13}>
                <SemanticForm.Group inline>
                {
                Array(numOfDays).fill(null).map((value, index) => (
                  <MySemanticRadioButton key={index}
                   label={(index + 1).toString().padStart(2, '0')}
                   value={(index + 1).toString()}
                   name='dayOfMonth'/>
                ))
                }                
                </SemanticForm.Group>
                </Grid.Column>
                 </Grid>
                  <Grid>
                  <Grid.Column width={3}>
                  </Grid.Column>
                  <Grid.Column width={13}>
                  <SemanticForm.Group inline>
                    {
                     Array(numOfDays).fill(null).map((value, index) => (
                        <MySemanticRadioButton key={index}
                            label={(index  + 11).toString()}
                            value={(index  + 11).toString()}
                            name='dayOfMonth'/>
                         ))
                         }                
                    </SemanticForm.Group>
                    </Grid.Column>
                    </Grid>
                    <Grid>
                    <Grid.Column width={3}/>
                    <Grid.Column width={13}>
                  <SemanticForm.Group inline>
                    {
                     Array(numOfDays -2 ).fill(null).map((value, index) => (
                        <MySemanticRadioButton key={index}
                            label={(index  + 21).toString()}
                            value={(index  + 21).toString()}
                            name='dayOfMonth'/>
                         ))
                    }                
                    </SemanticForm.Group>
                    </Grid.Column>
                    </Grid>
                 </>  
                }
                 {
                      values.interval === 'monthlyByWeekDay' &&  
                  <Grid>
                      <Grid.Column width={3}>
                         <strong>Week Of Month:</strong>
                     </Grid.Column>
                     <Grid.Column width={13}>
                        <SemanticForm.Group inline>
                        <MySemanticRadioButton label="1st Week" value='1' name='weekOfMonth'/>
                        <MySemanticRadioButton label="2nd Week" value='2' name='weekOfMonth'/>
                        <MySemanticRadioButton label="3rd Week" value='3' name='weekOfMonth'/>
                        <MySemanticRadioButton label="4th Week" value='4' name='weekOfMonth'/>
                    </SemanticForm.Group>
                </Grid.Column>
                  </Grid>
                  }
                    <Grid>
                 <Grid.Column width={3}>
                    <strong>*Interval Start:</strong>
                </Grid.Column>
                <Grid.Column width={13}>
                <MyDateInput
                placeholderText='Interval Start Date'
                name='intervalStart'
                dateFormat='MMMM d, yyyy'
                />
                </Grid.Column>
                </Grid>
                <Grid style={{marginBottom: '20px'}}>
                 <Grid.Column width={3}>
                    <strong>*Interval End:</strong>
                </Grid.Column>
                <Grid.Column width={13}>
                <MyDateInput
                placeholderText='Interval End Date'
                name='intervalEnd'
                dateFormat='MMMM d, yyyy'
                />
                </Grid.Column>
                </Grid>
                <Button
              disabled={isSubmitting  || !isValid || !dirty}
              loading={isSubmitting} floated='right' positive type='submit' content='Submit' />
              <Button  floated='right' type='button' content='Cancel'  onClick={() => modalStore.closeModal()} />
            </Form>
        )}
        </Formik>
      </>
    )
})
