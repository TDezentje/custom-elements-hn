import { BaseModel } from "models/base.model";


export class User extends BaseModel {
    about: string;
    id: string;
    karma: number;
    created: string;
}