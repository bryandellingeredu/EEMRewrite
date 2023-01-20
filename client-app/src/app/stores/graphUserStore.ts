import {GraphUser} from "../models/graphUser"
import { makeAutoObservable, runInAction} from "mobx";
import agent from "../api/agent";
import { PublicClientApplication } from "@azure/msal-browser";
import { toast } from "react-toastify";

// graph user store handles the graph users, army and edu, the c# eem application user is handled by the user store

export default class GraphUserStore {
    eduGraphUser: GraphUser | undefined = undefined;
    loadingInitial = false;
    loadingSignIntoArmy365 = false;
    loadingArmy = false;
    loggedIntoArmy = false;
    armyMsalConfig = {
      auth: {
          // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
          clientId: "780198a8-aa95-4d15-82b9-bbdf17c13bad",
          // Full directory URL, in the form of https://login.microsoftonline.com/<tenant-id>
          authority: "https://login.microsoftonline.com/common",
          // Full redirect URL, in form of http://localhost:3000
          redirectUri: process.env.REDIRECT_URI_ARMY,
      },
      cache: {
          cacheLocation: "sessionStorage", // This configures where your cache will be stored
          storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
      },   
  };
  graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  };
  loginRequest = {
    scopes: ["User.Read"]
};
myMSALObj = new PublicClientApplication(this.armyMsalConfig);
armyUserName = '';
armyToken = '';
armyProfile : GraphUser | null = null;

    constructor() {
        makeAutoObservable(this);
      }

      getArmy365Token = async() =>{
        try{
        const account = this.myMSALObj.getAccountByUsername(this.armyUserName);
        let request : any = this.armyMsalConfig;
        request.account = account;
        const response = await this.myMSALObj.acquireTokenSilent(request);
        this.setArmyToken(response.accessToken);
        window.localStorage.setItem('armyToken', response.accessToken);
        return response;
        }
        catch(error){
        // let armyToken = window.localStorage.getItem('armyToken');
         // if(armyToken){
           // this.setArmyToken(armyToken);
        //  }else{
            this.setArmyToken('');
            this.setLoggedIntoArmy(false);
            toast.error('Error Getting Army Access Token - please login again',
            {
              position: "top-center",
              autoClose: 25000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
              });
            console.log('error acquiring token');
            console.log(error);
         // }        
        }
      } 

      callArmyMSGraph = async () => {
        const headers = new Headers();
        const bearer = `Bearer ${this.armyToken}`;
    
        headers.append("Authorization", bearer);
    
        const options = {
            method: "GET",
            headers: headers
        };
    
        console.log('request made to Graph API at: ' + new Date().toString());
    
        try {
            const response = await fetch(this.graphConfig.graphMeEndpoint, options);
            const jsonResponse = await response.json();
            this.setArmyProfile(jsonResponse);
            return jsonResponse;
        } catch (error) {
            console.log(error);
            this.setArmyProfile(null);
            this.setArmyToken('');
            this.setLoggedIntoArmy(false);
           // window.localStorage.removeItem('armyToken');
        }
    }

     getAndSetArmyProfile : any = async() =>{
      try{
        
        await this.getArmy365Token();
       const response = await this.callArmyMSGraph();
       return response;

      } catch(error){
        this.setArmyProfile(null);
        console.log(error);
      }
      

     }

     signIntoArmy365 = async () => {
      debugger;
      this.setLoadingSignIntoArmy365(true);
      try{
        await this.signInArmy();
        await this.getAndSetArmyProfile();
        this.setLoadingSignIntoArmy365(false);
      }catch(error){
        this.setLoadingSignIntoArmy365(false);
        console.log(error);

        toast.error('Error Signing into Army 365 - please login again',
        {
          position: "top-center",
          autoClose: 25000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          });
        
      }
     }

      signInArmy = async() =>{
        this.setLoadingArmy(true);
        try {
          const loginResponse = await this.myMSALObj.loginPopup(this.loginRequest);
          if (loginResponse !== null) {
            this.setArmyUserName(loginResponse!.account!.username);
            this.setLoggedIntoArmy(true);
            this.setLoadingArmy(false);
            console.log(this.armyUserName);
            
        }
          } catch (error) {
          this.setArmyToken('');
       //   window.localStorage.removeItem('armyToken');
          this.setLoggedIntoArmy(false);
          this.setLoadingArmy(false);
          this.setArmyProfile(null);
          toast.error('Error Logging into Army 365 - please login again',
          {
            position: "top-center",
            autoClose: 25000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            });
          console.error(error);
          }    
      }

      loadEDUGraphUser = async () => {
        if(!agent.IsEDUSignedIn){
           this.eduGraphUser = undefined;
           return this.eduGraphUser;
        }
        if (!this.eduGraphUser) {
            this.setLoadingInitial(true); 
            try{
                const graphResponse: GraphUser = await agent.GraphUser.details();
                runInAction(() => {
                this.eduGraphUser = graphResponse
                  })          
            } catch (error) {
              console.log(error);            
            } finally  {
                this.setLoadingInitial(false);
                return this.eduGraphUser;
            }
        } else {
            return this.eduGraphUser;
        }
      }

      setLoadingInitial = (state: boolean) => this.loadingInitial = state;
      setLoadingArmy = (state: boolean) => this.loadingInitial = state;
      setArmyUserName = (state: string) =>  this.armyUserName = state;
      setLoggedIntoArmy = (state: boolean) => this.loggedIntoArmy = state;
      setArmyToken = (state: string) => this.armyToken = state;
      setArmyProfile =(data : any) => this.armyProfile = data;
      setLoadingSignIntoArmy365 = (state: boolean) => this.loadingSignIntoArmy365 = state;

        
    
}