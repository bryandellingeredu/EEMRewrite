import { observer } from "mobx-react-lite";
import {
  Divider,
  Grid,
  Header,
  Form as SemanticForm,
  Button,
  Step,
  Icon,
  Label,
} from "semantic-ui-react";
import {
  Recurrence,
  RecurrenceFormValues,
} from "../../../app/models/recurrence";
import { Formik, Form, yupToFormErrors } from "formik";
import MySemanticRadioButton from "../../../app/common/form/MySemanticRadioButton";
import MySemanticCheckBox from "../../../app/common/form/MySemanticCheckbox";
import MyDateInput from "../../../app/common/form/MyDateInput";
import { useStore } from "../../../app/stores/store";
import { useState } from "react";
import MySelectInput from "../../../app/common/form/MySelectInput";
import RecurrenceMessage from "../recurrenceMessage/RecurrenceMessage";

interface Props {
  recurrence: Recurrence;
  start: Date;
  setRecurrence: (recurrence: Recurrence) => void;
  setRecurrenceInd: (recurrenceInd: boolean) => void;
}

export default observer(function RecurrenceInformation({
  recurrence,
  setRecurrence,
  setRecurrenceInd,
  start,
}: Props) {
  const { modalStore } = useStore();
  const [active, setActive] = useState<string>("step1");
  const [step1Complete, setStep1Complete] = useState<boolean>(false);
  const [step2Complete, setStep2Complete] = useState<boolean>(false);
  const [step3Complete, setStep3Complete] = useState<boolean>(false);
  const [weeklyRepeatType, setWeeklyRepeatType] = useState<string>(
    recurrence.weeklyRepeatType
  );
  const [monthlyRepeatType, setMonthlyRepeatType] = useState<string>(
    recurrence.monthlyRepeatType
  );
  const [monthlyDayType, setMonthlyDayType] = useState<string>(
    recurrence.monthlyDayType
  );

  const handleStep1Click = () => {
    setActive("step1");
  };

  const handleStep2Click = () => {
    setActive("step2");
    setStep1Complete(true);
  };

  const handleStep3Click = () => {
    setActive("step3");
    setStep2Complete(true);
  };

  const handleStep4Click = () => {
    setActive("step4");
    setStep3Complete(true);
  };

  function handleFormSubmit(recurrence: RecurrenceFormValues) {
    recurrence.weeklyRepeatType = weeklyRepeatType;
    recurrence.monthlyRepeatType = monthlyRepeatType;
    recurrence.monthlyDayType = monthlyDayType;
    console.log(recurrence);
    setRecurrence(recurrence);
    setRecurrenceInd(true);
    modalStore.closeModal();
  }
  let numOfDays = 10;
  return (
    <>
      <Button
        floated="right"
        icon
        size="mini"
        color="black"
        compact
        onClick={() => modalStore.closeModal()}
      >
        <Icon name="close" />
      </Button>
      <Header as="h2">
        <Icon name="repeat" />
        <Header.Content>
          Repeat
          <Header.Subheader>Set your preferences</Header.Subheader>
        </Header.Content>
      </Header>
      <Divider />

      <Step.Group ordered widths={4}>
        <Step
          completed={step1Complete}
          active={active === "step1"}
          link
          onClick={handleStep1Click}
        >
          <Step.Content>
            <Step.Title>Iteration</Step.Title>
            <Step.Description>
              Choose daily, weekly, or monthly
            </Step.Description>
          </Step.Content>
        </Step>

        <Step
          completed={step2Complete}
          active={active === "step2"}
          link
          onClick={handleStep2Click}
        >
          <Step.Content>
            <Step.Title>Start Date</Step.Title>
            <Step.Description>Set your iteration start date</Step.Description>
          </Step.Content>
        </Step>

        <Step
          completed={step3Complete}
          active={active === "step3"}
          link
          onClick={handleStep3Click}
        >
          <Step.Content>
            <Step.Title>Set Options</Step.Title>
            <Step.Description>Configure your repeating event</Step.Description>
          </Step.Content>
        </Step>

        <Step active={active === "step4"} link onClick={handleStep4Click}>
          <Step.Content>
            <Step.Title>Review and Save</Step.Title>
            <Step.Description>Confirm your settings and save</Step.Description>
          </Step.Content>
        </Step>
      </Step.Group>

      <Formik
        enableReinitialize
        initialValues={{ ...recurrence, intervalStart: start }}
        onSubmit={(values) => handleFormSubmit(values)}
      >
        {({ handleSubmit, isSubmitting, values, dirty }) => (
          <Form
            className="ui form"
            onSubmit={handleSubmit}
            autoComplete="off"
            style={{ paddingBottom: "20px" }}
          >
            {active === "step1" && (
              <>
                <Grid>
                  <Grid.Column width={5}>
                    <strong>
                      *Should this event repeat daily, weekly, or monthly?
                    </strong>
                  </Grid.Column>
                  <Grid.Column width={8}>
                    <SemanticForm.Group inline>
                      <MySemanticRadioButton
                        label="Daily"
                        value="daily"
                        name="interval"
                      />
                      <MySemanticRadioButton
                        label="Weekly"
                        value="weekly"
                        name="interval"
                      />
                      <MySemanticRadioButton
                        label="Monthly"
                        value="monthly"
                        name="interval"
                      />
                    </SemanticForm.Group>
                  </Grid.Column>
                </Grid>
                <Button
                  icon
                  labelPosition="right"
                  floated="right"
                  type="button"
                  onClick={handleStep2Click}
                  color="green"
                >
                  Next
                  <Icon name="arrow right" />
                </Button>
              </>
            )}

            {active === "step2" && (
              <>
                <Grid>
                  <Grid.Column width={5}>
                    <strong>*Choose when the interval should start</strong>
                  </Grid.Column>
                  <Grid.Column width={8}>
                    <MyDateInput
                      placeholderText="Interval Start Date"
                      name="intervalStart"
                      dateFormat="MMMM d, yyyy"
                    />
                  </Grid.Column>
                </Grid>
                <Button
                  icon
                  labelPosition="left"
                  floated="left"
                  type="button"
                  onClick={handleStep1Click}
                  color="green"
                >
                  Previous
                  <Icon name="arrow left" />
                </Button>
                <Button
                  icon
                  labelPosition="right"
                  floated="right"
                  type="button"
                  onClick={handleStep3Click}
                  color="green"
                >
                  Next
                  <Icon name="arrow right" />
                </Button>
              </>
            )}

            {active === "step3" && values.interval === "daily" && (
              <>
                <Grid>
                  <Grid.Row>
                    <Grid.Column width={5}>
                      <strong>
                        *Pick the number of days this event will repeat
                      </strong>
                    </Grid.Column>
                    <Grid.Column width={8}>
                      <MySelectInput
                        placeholder="Choose the number of days this event will occur"
                        options={Array(100)
                          .fill(null)
                          .map((value, index) => ({
                            text: (index + 1).toString().padStart(2, "0"),
                            value: (index + 1).toString(),
                          }))}
                        name="daysRepeating"
                      />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column width={5}>
                      <strong>*Should this event occur on weekends?</strong>
                    </Grid.Column>
                    <Grid.Column width={8}>
                      <SemanticForm.Group inline>
                        <MySemanticRadioButton
                          name="weekendsIncluded"
                          label="Yes"
                          value="yes"
                        />
                        <MySemanticRadioButton
                          name="weekendsIncluded"
                          label="No"
                          value="no"
                        />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Button
                  icon
                  labelPosition="left"
                  floated="left"
                  type="button"
                  onClick={handleStep2Click}
                  color="green"
                >
                  Previous
                  <Icon name="arrow left" />
                </Button>
                <Button
                  icon
                  labelPosition="right"
                  floated="right"
                  type="button"
                  onClick={handleStep4Click}
                  color="green"
                >
                  Next
                  <Icon name="arrow right" />
                </Button>
              </>
            )}
            {active === "step3" && values.interval === "weekly" && (
              <>
                <Grid>
                  <Grid.Row>
                    <Grid.Column width={1}>
                      <strong>
                        Iteration
                      </strong>
                    </Grid.Column>
                    <Grid.Column width={14}>
                      <SemanticForm.Group inline>
                        <MySemanticRadioButton
                          name="weekInterval"
                          label="Every Week"
                          value="1"
                        />
                        <MySemanticRadioButton
                          name="weekInterval"
                          label="Every Other Week"
                          value="2"
                        />
                        <MySemanticRadioButton
                          name="weekInterval"
                          label="Every Third Week"
                          value="3"
                        />
                         <MySemanticRadioButton
                          name="weekInterval"
                          label="Every Fourth Week"
                          value="4"
                        />
                        <MySemanticRadioButton
                          name="weekInterval"
                          label="Every Fifth Week"
                          value="5"
                        />
                          <MySemanticRadioButton
                          name="weekInterval"
                          label="Every Sixth Week"
                          value="6"
                        />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column width={5}>
                      <strong>
                        Pick the day/s of the week this event will occur
                      </strong>
                    </Grid.Column>
                    <Grid.Column width={10}>
                      <SemanticForm.Group inline>
                        <MySemanticCheckBox label="Sunday" name="sunday" />
                        <MySemanticCheckBox label="Monday" name="monday" />
                        <MySemanticCheckBox label="Tuesday" name="tuesday" />
                        <MySemanticCheckBox
                          label="Wednesday"
                          name="wednesday"
                        />
                        <MySemanticCheckBox label="Thursday" name="thursday" />
                        <MySemanticCheckBox label="Friday" name="friday" />
                        <MySemanticCheckBox label="Saturday" name="saturday" />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column width={7}>
                      <Button.Group
                        style={{ marginTop: "8px", marginBottom: "20px" }}
                      >
                        <Button
                          positive={weeklyRepeatType === "number"}
                          onClick={() => setWeeklyRepeatType("number")}
                          type="button"
                        >
                          Choose number of times the event will occur{" "}
                        </Button>
                        <Button.Or />
                        <Button
                          positive={weeklyRepeatType === "date"}
                          onClick={() => setWeeklyRepeatType("date")}
                          type="button"
                        >
                          Pick an end date
                        </Button>
                      </Button.Group>
                    </Grid.Column>
                    <Grid.Column width={8}>
                      {weeklyRepeatType === "number" && (
                        <MySelectInput
                          placeholder="Choose the number of times this series will occurr"
                          options={Array(52)
                            .fill(null)
                            .map((value, index) => ({
                              text: (index + 1).toString().padStart(2, "0"),
                              value: (index + 1).toString(),
                            }))}
                          name="weeksRepeating"
                        />
                      )}
                      {weeklyRepeatType === "date" && (
                        <MyDateInput
                          placeholderText="Interval End Date"
                          name="intervalEnd"
                          dateFormat="MMMM d, yyyy"
                        />
                      )}
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Button
                  icon
                  labelPosition="left"
                  floated="left"
                  type="button"
                  onClick={handleStep2Click}
                  color="green"
                >
                  Previous
                  <Icon name="arrow left" />
                </Button>
                <Button
                  icon
                  labelPosition="right"
                  floated="right"
                  type="button"
                  onClick={handleStep4Click}
                  color="green"
                >
                  Next
                  <Icon name="arrow right" />
                </Button>
              </>
            )}

            {active === "step3" && values.interval === "monthly" && (
              <>
                <Grid>
                  <Grid.Row>
                    <Grid.Column width={5}>
                      <Button.Group style={{ marginTop: "7px" }}>
                        <Button
                          positive={monthlyDayType === "number"}
                          onClick={() => setMonthlyDayType("number")}
                          type="button"
                        >
                          pick weekday
                        </Button>
                        <Button.Or />
                        <Button
                          positive={monthlyDayType === "date"}
                          onClick={() => setMonthlyDayType("date")}
                          type="button"
                        >
                          pick day of month
                        </Button>
                      </Button.Group>
                    </Grid.Column>

                    {monthlyDayType === "number" && (
                      <>
                        <Grid.Column width={4}>
                          <MySelectInput
                            placeholder=""
                            options={Array(4)
                              .fill(null)
                              .map((value, index) => ({
                                text:
                                  index === 0
                                    ? "The First"
                                    : index === 1
                                    ? "The Second"
                                    : index === 2
                                    ? "The Third"
                                    : "The Fourth",
                                value: (index + 1).toString(),
                              }))}
                            name="weekOfMonth"
                          />
                        </Grid.Column>
                        <Grid.Column width={4}>
                          <MySelectInput
                            placeholder=""
                            options={Array(7)
                              .fill(null)
                              .map((value, index) => ({
                                text:
                                  index === 0
                                    ? "Sunday"
                                    : index === 1
                                    ? "Monday"
                                    : index === 2
                                    ? "Tuesday"
                                    : index === 3
                                    ? "Wednesday"
                                    : index === 4
                                    ? "Thursday"
                                    : index === 5
                                    ? "Friday"
                                    : "Saturday",
                                value: index.toString(),
                              }))}
                            name="weekdayOfMonth"
                          />
                        </Grid.Column>
                        <Grid.Column width={3}>
                          <Label
                            content="Of The Month"
                            color="green"
                            style={{ marginTop: "10px" }}
                          />
                        </Grid.Column>
                      </>
                    )}

                    {monthlyDayType === "date" && (
                      <Grid.Column width={8}>
                        <Grid.Row style={{ marginTop: "10px" }}>
                          <SemanticForm.Group inline>
                            {Array(numOfDays)
                              .fill(null)
                              .map((value, index) => (
                                <MySemanticRadioButton
                                  key={index}
                                  label={(index + 1)
                                    .toString()
                                    .padStart(2, "0")}
                                  value={(index + 1).toString()}
                                  name="dayOfMonth"
                                />
                              ))}
                          </SemanticForm.Group>
                        </Grid.Row>
                        <Grid.Row>
                          <SemanticForm.Group inline>
                            {Array(numOfDays)
                              .fill(null)
                              .map((value, index) => (
                                <MySemanticRadioButton
                                  key={index + 11}
                                  label={(index + 11)
                                    .toString()
                                    .padStart(2, "0")}
                                  value={(index + 11).toString()}
                                  name="dayOfMonth"
                                />
                              ))}
                          </SemanticForm.Group>
                        </Grid.Row>
                        <Grid.Row>
                          <SemanticForm.Group inline>
                            {Array(numOfDays - 2)
                              .fill(null)
                              .map((value, index) => (
                                <MySemanticRadioButton
                                  key={index + 21}
                                  label={(index + 21)
                                    .toString()
                                    .padStart(2, "0")}
                                  value={(index + 21).toString()}
                                  name="dayOfMonth"
                                />
                              ))}
                          </SemanticForm.Group>
                        </Grid.Row>
                      </Grid.Column>
                    )}
                  </Grid.Row>

                  <Grid.Row>
                    <Grid.Column width={8}>
                      <Button.Group style={{ marginTop: "8px" }}>
                        <Button
                          positive={monthlyRepeatType === "number"}
                          onClick={() => setMonthlyRepeatType("number")}
                          type="button"
                        >
                          Choose the number of months the event will occur{" "}
                        </Button>
                        <Button.Or />
                        <Button
                          positive={monthlyRepeatType === "date"}
                          onClick={() => setMonthlyRepeatType("date")}
                          type="button"
                        >
                          Pick an end date
                        </Button>
                      </Button.Group>
                    </Grid.Column>
                    <Grid.Column width={6}>
                      {monthlyRepeatType === "number" && (
                        <MySelectInput
                          placeholder="Choose the number of months this event will occur"
                          options={Array(12)
                            .fill(null)
                            .map((value, index) => ({
                              text: (index + 1).toString().padStart(2, "0"),
                              value: (index + 1).toString(),
                            }))}
                          name="monthsRepeating"
                        />
                      )}
                      {monthlyRepeatType === "date" && (
                        <MyDateInput
                          placeholderText="Interval End Date"
                          name="intervalEnd"
                          dateFormat="MMMM d, yyyy"
                        />
                      )}
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Button
                  icon
                  labelPosition="left"
                  floated="left"
                  type="button"
                  onClick={handleStep2Click}
                  color="green"
                  style={{ marginTop: "20px", marginBottom: "10px" }}
                >
                  Previous
                  <Icon name="arrow left" />
                </Button>
                <Button
                  icon
                  labelPosition="right"
                  floated="right"
                  type="button"
                  onClick={handleStep4Click}
                  color="green"
                  style={{ marginTop: "20px", marginBottom: "10px" }}
                >
                  Next
                  <Icon name="arrow right" />
                </Button>
              </>
            )}
            {active === "step4" && (
              <>
                <RecurrenceMessage
                  values={values}
                  weeklyRepeatType={weeklyRepeatType}
                  monthlyDayType={monthlyDayType}
                  monthlyRepeatType={monthlyRepeatType}
                />

                <Button
                  icon
                  labelPosition="left"
                  floated="left"
                  type="button"
                  onClick={handleStep3Click}
                  color="green"
                >
                  Previous
                  <Icon name="arrow left" />
                </Button>
                <Button
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  floated="right"
                  positive
                  type="submit"
                  content="Submit"
                />
              </>
            )}
          </Form>
        )}
      </Formik>
    </>
  );
});
