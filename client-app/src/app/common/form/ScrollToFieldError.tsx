import { useFormikContext } from "formik"
import {useEffect} from "react"

export default function(){
    const { submitCount, isValid, errors } = useFormikContext();

    useEffect(() => {
      debugger;
        if (isValid) return
        console.log(errors);
        const names = Object.keys(errors);
        for (let i = 0; i < names.length; i++) {
          const element = document.querySelector(`input[name='${names[i]}']`);
          if(element){
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
          }  
        }
      }, [submitCount]);

      return null;
}