import { observer } from "mobx-react-lite";
import { Label } from "semantic-ui-react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useStore } from "../../app/stores/store";
import { useEffect} from "react";

export default observer(function IMCLegend() {
  const { categoryStore } = useStore();
  const { categories, loadingInitial } = categoryStore;

  useEffect(() => {
    if(!categories.length) categoryStore.loadCategories();
   }, [categories.length])

  return (
    <>
      {loadingInitial
        && <LoadingComponent content='Loading Legend' />
      }
      {!loadingInitial &&
        <div>
        {categories.filter(x => x.imcColor && x.imcColor.length)
        .filter(
          (item) =>
            item.name !== "PKSOI Calendar" && item.name !== "Staff Calendar" && item.name !== "Other"
        ).map(category => (
        <Label key={category.id} style={{backgroundColor: category.imcColor, color: 'white', marginBottom: '5px'}} content = {category.name === 'Academic IMC Event'? 'Academic Event' : category.name} />
      ))}
      </div>
      }
    </>
  )
})