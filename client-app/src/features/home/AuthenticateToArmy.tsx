import { Button, ButtonGroup } from "semantic-ui-react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";


export default observer (function AuthenticateToArmy(){
    const {graphUserStore} = useStore();
    const {signInArmy, loadingArmy,  getAndSetArmyProfile } = graphUserStore;

    return(
        <ButtonGroup>
        <Button size = "huge" type="button" primary onClick={signInArmy} loading={loadingArmy}>
            Authenticate To Army
        </Button>
        <Button size = "huge" type="button" primary onClick={getAndSetArmyProfile}>
          Get Profile
      </Button>
      </ButtonGroup>
    )
});