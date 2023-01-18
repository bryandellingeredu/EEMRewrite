import { Button } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";

export default function LoginToArmy365() {
    const {
        graphUserStore,
      } = useStore();

 const { signIntoArmy365, loadingSignIntoArmy365  } = graphUserStore;

 return (
 <Button type='button' primary onClick={signIntoArmy365} loading={loadingSignIntoArmy365}>
    Log Into Army 365
 </Button>
 )

}