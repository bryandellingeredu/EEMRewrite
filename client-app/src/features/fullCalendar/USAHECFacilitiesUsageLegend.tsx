import { observer } from "mobx-react-lite";
import { Label } from "semantic-ui-react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useStore } from "../../app/stores/store";
import { useEffect} from "react";

export default observer(function USAHECFacilitiesUsageLegend() {
  const { usahecFacilitiesUsageLegendStore } = useStore();
  const { legend, loadingInitial, loadLegend } = usahecFacilitiesUsageLegendStore;

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
        {legend.map(item => (
        <Label key={item.id} style={{backgroundColor: item.color, color: 'white', marginBottom: '5px'}} content = {item.name} />
      ))}
      </div>
      }
    </>
  )
})