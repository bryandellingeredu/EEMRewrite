import { observer } from "mobx-react-lite";
import { useState, useEffect, useRef } from "react";
import { useStore } from "../../app/stores/store";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Link, useHistory, useParams } from "react-router-dom";
import { ActivityFormValues } from "../../app/models/activity";
import { EditorState, convertFromRaw } from "draft-js";
import { useReactToPrint } from "react-to-print";
import { ItineraryComponentToPrint } from "./itineraryComponentToPrint";
import {
  Button,
  Divider,
  Header,
  Icon,
} from "semantic-ui-react";


export default observer(function Itinerary() {
  const history = useHistory();
  const { activityStore, graphUserStore } = useStore();
  const { loadActivity, loadingInitial } = activityStore;
  const { armyProfile } = graphUserStore;
  const { id } = useParams<{ id: string }>();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [activity, setActivity] = useState<ActivityFormValues>(
    new ActivityFormValues()
  );
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });



  useEffect(() => {
    loadActivity(id, categoryId).then((response) => {
      setActivity(new ActivityFormValues(response));
      if (response?.hostingReport?.guestItinerary) {
        setEditorState(
          EditorState.createWithContent(
            convertFromRaw(JSON.parse(response!.hostingReport!.guestItinerary))
          )
        );
      } else {
        setEditorState(EditorState.createEmpty());
      }
    });
  }, []);

  return (
    <>
      <Divider horizontal>
        <Header as="h2">
          <Icon name="file" />
          View and Print {activity.report} Itinerary
        </Header>
      </Divider>
      {loadingInitial && <LoadingComponent content="Loading Itinerary" />}
      {(!armyProfile || (!armyProfile?.mail && !loadingInitial)) && (
        <div className="ui yellow message" style={{ textAlign: "center" }}>
          <div className="header">
            You are not authorized to work with Hosting or Outsider Reports.
          </div>
          If you would like to work with reports you must first sign into your
          army 365 account.
          <div style={{ textAlign: "center" }}>
            <Link
              to={`${process.env.PUBLIC_URL}/authenticatetoarmy`}
              className="ui primary button"
            >
              Log Into Army 365
            </Link>
            <Link
                 to={`${process.env.PUBLIC_URL}/activities/${id}/${categoryId}`}
                  className="ui secondary button"
                >
                  Back to Event Details
            </Link>
          </div>
        </div>
      )}

      {!loadingInitial &&
        armyProfile &&
        armyProfile.mail &&
        activity.hostingReport &&
        activity.hostingReport.guestItinerary && (
          <>
            <ItineraryComponentToPrint ref={componentRef} activity={activity} />

            <Button
              color="brown"
              icon
              labelPosition="left"
              as={Link}
              to={`${process.env.PUBLIC_URL}/activities/${activity.id}/${activity.categoryId}`}
            >
              <Icon name="backward" />
              Back
            </Button>
            <Button
              color="teal"
              icon
              labelPosition="left"
              onClick={handlePrint}
            >
              <Icon name="print" />
              Print Itinerary
            </Button>
          </>
        )}
    </>
  );
});
