import { observer } from "mobx-react-lite";
import { Icon, Label } from "semantic-ui-react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useStore } from "../../app/stores/store";
import { useEffect} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";

export default observer(function USAHECFacilitiesUsageLegend() {
  const { usahecFacilitiesUsageLegendStore } = useStore();
  const { legend, loadingInitial, loadLegend } = usahecFacilitiesUsageLegendStore;
  const allowedNames = 
  ["AHEC", "AHCF", "Holiday", "Public Event", "Billable Event", "AWC/CBKS Tenant", "AHEC Highlight",
    "AWC Event", "Tour", "Self Setup / Standard Setup", "Paying for Setup"];

  useEffect(() => {
    if(!legend.length) loadLegend();
   }, [legend.length])

  return (
    <>
      {loadingInitial
        && <LoadingComponent content='Loading Legend' />
      }
      {!loadingInitial &&
        <div>
      {legend.filter(item => allowedNames.includes(item.name)).map(item => (
        <Label key={item.id} style={{backgroundColor: item.color, color: 'white', marginBottom: '5px'}} content = {item.name} />
      ))}
            <Label style={{ marginBottom: '5px'}} color='grey'>
      <Icon name='redo alternate' /> Repeating Event
      </Label>
      <Label style={{ marginBottom: '5px'}} color='grey'>
      <Icon name='tv' /> Teams Meeting
      </Label>
      <Label style={{ marginBottom: '5px'}} color='grey'>
      <FontAwesomeIcon icon={faCalendarPlus} className="fa-calendar-plus"  style={{ marginRight: '8px' }} />From Other Calendar
      </Label>
      </div>
      }
    </>
  )
})