import { useFormikContext } from "formik"
import {useEffect} from "react"

export default function(){
    const { submitCount, isValid} = useFormikContext();


    useEffect(() => {
        if (isValid) return
        const elArray = document.querySelectorAll('.ui.red.basic.label');
        for (let i = 0; i < elArray.length; i++) {
          if (elArray[i] && elArray[i].parentElement){
            elArray[i].parentElement!.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
          }
          if(elArray[i]){
            elArray[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
          }
        }
      }, [submitCount]);

      return null;
}