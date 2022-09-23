import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { Button, Header, Segment } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Formik, Form } from "formik";
import * as Yup from 'yup';
import MyTextInput from "../../../app/common/form/MyTextInput";
import MyTextArea from "../../../app/common/form/MyTextArea";
import MySelectInput from "../../../app/common/form/MySelectInput";
import MyDateInput from "../../../app/common/form/MyDateInput";
import MyDataList from "../../../app/common/form/MyDataList";
import { ActivityFormValues } from "../../../app/models/activity";
import { v4 as uuid } from 'uuid';
import MyCheckBox from "../../../app/common/form/MyCheckBox";


export default observer(function ActivityForm() {

  const history = useHistory();
  const { activityStore, categoryStore, organizationStore, locationStore } = useStore();
  const { createGraphEvent, updateGraphEvent, createActivity, updateActivity,
    loadActivity, loadingInitial } = activityStore;
  const { categoryOptions, categories, loadCategories } = categoryStore;
  const { locationOptions, loadLocations } = locationStore;
  const { organizationOptions, organizations, loadOrganizations } = organizationStore;
  const { id } = useParams<{ id: string }>();
  const { categoryId } = useParams<{ categoryId: string }>();

  const [activity, setActivity] = useState<ActivityFormValues>(new ActivityFormValues());

  const validationSchema = Yup.object({
    title: Yup.string().required('The title is required'),
    categoryId: Yup.string().required('Please choose a sub calendar'),
    start: Yup.string().required().nullable(),
    end: Yup.string().required().nullable(),
    actionOfficer: Yup.string().when("categoryId", {
      is: categories.find(x => x.name === "Academic Calendar")?.id,
      otherwise: Yup.string().required()
    }),
    actionOfficerPhone: Yup.string().when("categoryId", {
      is: categories.find(x => x.name === "Academic Calendar")?.id,
      otherwise: Yup.string().required()
    })

  })



  useEffect(() => {
    if (id) {
      loadActivity(id, categoryId).then(response => setActivity(new ActivityFormValues(response)));
      loadOrganizations();
      loadLocations();
    } else {
      loadCategories();
      loadOrganizations();
      loadLocations();
    }
  }, [id, categoryId,
    loadActivity, loadCategories, loadOrganizations, loadLocations,
    categoryStore.loadingInitial, organizationStore.loadingInitial, locationStore.loadingInitial,
    loadingInitial]);

  function handleFormSubmit(activity: ActivityFormValues) {
    const category = categories.find(x => x.id === activity.categoryId)!
    const organization = activity.organizationId ? organizations.find(x => x.id === activity.organizationId) || null : null;
    activity.organizationId = activity.organizationId || null;
    activity.category = category;
    activity.organization = organization;
    if (!activity.id) {
      let newActivity = {
        ...activity,
        id: category.name === 'Academic Calendar' ? '' : uuid(),
      };
      category.name === 'Academic Calendar'
        ? createGraphEvent(newActivity).then(() => history.push(`/activities/${newActivity.id}/${category.id}`))
        : createActivity(newActivity).then(() => history.push(`/activities/${newActivity.id}/${category.id}`))
    } else {
      category.name === 'Academic Calendar'
        ? updateGraphEvent({ ...activity, id: activity!.id }).then(() => history.push(`/activities/${activity.id}/${category.id}`))
        : updateActivity({ ...activity, id: activity!.id }).then(() => history.push(`/activities/${activity.id}/${category.id}`))
    }
  }

  if (loadingInitial
    || categoryStore.loadingInitial
    || organizationStore.loadingInitial
    || locationStore.loadingInitial) {
    return (
      <LoadingComponent content='Loading form...' />
    )
  }

  return (
    <Segment clearing>
      <Header content={activity.id ? 'Update ' : 'Create New '} Calendar Event sub color='teal' />
      <Formik enableReinitialize
        validationSchema={validationSchema}
        initialValues={activity}
        onSubmit={values => handleFormSubmit(values)}>

        {({ handleSubmit, isValid, isSubmitting, dirty, values }) => (
          <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
            <MyTextInput name='title' placeholder='title' label='*Title' />
            <MyTextArea rows={3} placeholder='Description' name='description' label='Description' />
            <MySelectInput options={categoryOptions} placeholder='Sub Calendar' name='categoryId' label='*Sub Calendar' />
            <MyCheckBox name='allDayEvent' label='All Day Event' />
            {!values.allDayEvent &&
              <MyDateInput
                timeIntervals={15}
                placeholderText='Start Date / Time'
                name='start'
                showTimeSelect
                timeCaption='time'
                dateFormat='MMMM d, yyyy h:mm aa'
                title='*Start' />
            }
            {values.allDayEvent &&
              <MyDateInput
                placeholderText='Start Date'
                name='start'
                dateFormat='MMMM d, yyyy'
                title='*Start' />
            }
            {!values.allDayEvent &&
              <MyDateInput
                timeIntervals={15}
                placeholderText='End Date / Time'
                name='end'
                showTimeSelect
                timeCaption='time'
                dateFormat='MMMM d, yyyy h:mm aa'
                title='*End' />
            }
            {values.allDayEvent &&
              <MyDateInput
                placeholderText='End Date'
                name='end'
                dateFormat='MMMM d, yyyy'
                title='*End' />
            }
            <MyDataList name='primaryLocation'
              placeholder='Primary Location'
              label='Primary Location'
              dataListId="locations"
              options={locationOptions}
            />
            {values.categoryId && categories.find(x => x.id === values.categoryId)?.name !== 'Academic Calendar' &&
              <>
                <MySelectInput options={organizationOptions} placeholder='Lead Org' name='organizationId' label='Lead Org' />
                <MyTextInput name='actionOfficer' placeholder='Action Officer' label='*Action Officer' />
                <MyTextInput name='actionOfficerPhone' placeholder='Action Officer Duty Phone' label='*Action Officer Duty Phone' />
              </>
            }

            <Button
              disabled={isSubmitting || !isValid || !dirty}
              loading={isSubmitting} floated='right' positive type='submit' content='Submit' />
            <Button as={Link} to='/activities' floated='right' type='button' content='Cancel'
            />
          </Form>

        )}

      </Formik>

    </Segment>
  )
})