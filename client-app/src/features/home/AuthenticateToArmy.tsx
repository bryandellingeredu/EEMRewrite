import { Button, ButtonGroup } from "semantic-ui-react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoadingComponent from "../../app/layout/LoadingComponent";



export default observer (function AuthenticateToArmy(){


    const [isLoading, setIsLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true)
    const {graphUserStore} = useStore();
    const {signIntoArmy365} = graphUserStore;
    const history = useHistory();

    useEffect(() => {
        (async () => {
            await handleButtonClick();
            setInitialLoad(false);
        })();
     }, []);


    const handleButtonClick = async () => {
        try{
            setIsLoading(true);
            await signIntoArmy365()
            history.goBack();
        } catch (error){
            setIsLoading(false);
            console.log(error);
            setInitialLoad(false);
        }
    }
    
    return(
        <>
        {initialLoad &&
        <LoadingComponent content="Signing In To Army 365..." />
        }
        {!initialLoad && 
        <ButtonGroup>
        <Button size = "huge" type="button" primary onClick={handleButtonClick} loading={isLoading}>
            Sign in  To Army 365
        </Button>
      </ButtonGroup>
        }
        </>
    )
});