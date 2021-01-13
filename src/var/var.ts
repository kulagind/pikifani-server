import { Variables } from './../interfaces/variables';
import varDev from './var.dev';
import varProd from './var.prod';

let variables: Variables;

if (process.env.NODE_ENV === 'production') {
    variables = varProd;
} else {
    variables = varDev;
}

export default variables;