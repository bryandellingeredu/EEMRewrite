import { makeAutoObservable, runInAction } from "mobx";
import { history } from "../..";
import agent from "../api/agent";
import { GraphUser } from "../models/graphUser";
import { User, UserFormValues } from "../models/user";
import { store } from "./store";

// user store handles the C# EEM Application user.   the graph users, army and edu, are handled in the graph user store
export default class UserStore {
    user: User | null = null;
    refreshTokenTimeout: any;
    loadingInitial = false;
    errors: string[] = [];

    constructor(){
        makeAutoObservable(this)
    }

    get isLoggedIn() {
        return !!this.user;
    }

    login = async (creds: UserFormValues) => {
        try{
            const user = await agent.Account.login(creds);
            store.commonStore.setToken(user.token);
            user.roles = await agent.Account.getRoles(user.userName);
            this.startRefreshTokenTimer(user)
            const roles = await agent.Account.getRoles(user.userName);
            user.roles = roles;
            runInAction(() =>  this.user = user)
            if(store.commonStore.redirectId && store.commonStore.redirectCategoryId){
                history.push(`${process.env.PUBLIC_URL}/activities/${store.commonStore.redirectId}/${store.commonStore.redirectCategoryId}`)
            }else{
               // history.push(`${process.env.PUBLIC_URL}/activityTable`);
            } 
           
            store.modalStore.closeModal();
            this.user = user;
        } catch (error){
            throw error;
        }
    }

    logout = async() => {
        try{
        store.commonStore.setToken(null);
        window.localStorage.removeItem('jwt');
        this.user = null;
        if(!!store.graphUserStore.armyProfile){
            store.graphUserStore.myMSALObj.logoutPopup();
            history.push(`${process.env.PUBLIC_URL}/`);
        } else{
            history.push(`${process.env.PUBLIC_URL}/`);
        }
     
    }catch(error){
        console.log('logout error')
        console.log(error);
        history.push(`${process.env.PUBLIC_URL}/`);
      }
    }

    getUser = async() => {
        try{
            const user = await agent.Account.current();
            const roles = await agent.Account.getRoles(user.userName);
            user.roles = roles;
            runInAction(() => this.user =  user);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
        } catch (error) {
            console.log(error);
        }
    }

    register = async (creds: UserFormValues) => {
        try {
            await agent.Account.register(creds);
            history.push(`${process.env.PUBLIC_URL}/account/registerSuccess?email=${creds.email}`);
            store.modalStore.closeModal();
        } catch (error) {
            throw error;
        }
    }

    signInCacUser = async() =>{
        try{
            this.setErrors([]);
            this.setLoadingInitial(true);
            const user = await agent.Account.signInCacUser();
            user.roles = await agent.Account.getRoles(user.userName);
            store.commonStore.setToken(user.token);
            runInAction(() =>  this.user = user)
            this.setLoadingInitial(false);
            if(store.commonStore.redirectId && store.commonStore.redirectCategoryId){
                history.push(`${process.env.PUBLIC_URL}/activities/${store.commonStore.redirectId}/${store.commonStore.redirectCategoryId}`)
            }else{
                history.push(`${process.env.PUBLIC_URL}/activityTable`);
            } 
        }catch(errors){
            this.setErrors(errors as string[])
            this.setLoadingInitial(false);
            throw errors;
        }
    } 

    signInArmyUser = async() => {
        try{
            this.setErrors([]);
            this.setLoadingInitial(true);
            await store.graphUserStore.signInArmy();
            const armyProfile  = await store.graphUserStore.getAndSetArmyProfile();
            if(armyProfile){
            const graphUser : GraphUser = armyProfile as GraphUser;
            const creds: UserFormValues = {
                password: `${graphUser.id}aA`,
                email: graphUser.mail,
                displayName: graphUser.displayName || graphUser.mail,
                userName: graphUser.mail,
            }
            const user = await agent.Account.signInGraphUser(creds);
            const roles = await agent.Account.getRoles(user.userName);
            user.roles = roles;
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
            runInAction(() =>  this.user = user)
            if(store.commonStore.redirectId && store.commonStore.redirectCategoryId){
                history.push(`${process.env.PUBLIC_URL}/activities/${store.commonStore.redirectId}/${store.commonStore.redirectCategoryId}`)
            }else{
                history.push(`${process.env.PUBLIC_URL}/activityTable`);
            } 
            }

        }
        catch(errors){
            this.setErrors(errors as string[])
            this.setLoadingInitial(false);
            throw errors;
        }
    }

    signInEDUGraphUser = async(graphUser: GraphUser) => {
      try{
        const creds: UserFormValues = {
            password: `${graphUser.id}aA`,
            email: graphUser.mail,
            displayName: graphUser.displayName || graphUser.mail,
            userName: graphUser.mail
        }
        const user = await agent.Account.signInGraphUser(creds);
        const roles = await agent.Account.getRoles(user.userName);
        user.roles = roles;
        store.commonStore.setToken(user.token);
        this.startRefreshTokenTimer(user);
        runInAction(() =>  this.user = user)
        if(store.commonStore.redirectId && store.commonStore.redirectCategoryId){
            history.push(`${process.env.PUBLIC_URL}/activities/${store.commonStore.redirectId}/${store.commonStore.redirectCategoryId}`)
        }
        //history.push(`${process.env.PUBLIC_URL}/activityTable`);
      } catch(error){
        throw error;
      }
    }

    refreshToken = async () =>{
        this.stopRefreshTokenTimer();
        try{
         const user = await agent.Account.refreshToken();
         const roles = await agent.Account.getRoles(user.userName);
         user.roles = roles;
         runInAction(() => this.user = user);
         store.commonStore.setToken(user.token);
         this.startRefreshTokenTimer(user)
        }catch(error){
            console.log(error);
        }
    }

    private startRefreshTokenTimer(user: User){
        const jwtToken = JSON.parse(atob(user.token.split('.')[1]));
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);
        this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);

    }

    private stopRefreshTokenTimer(){
        clearTimeout(this.refreshTokenTimeout);
    }

    setLoadingInitial = (state: boolean) => this.loadingInitial = state;

    setErrors = (errors: string[]) => this.errors = errors;
}