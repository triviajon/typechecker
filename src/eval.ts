import { Closure, Environment } from "./env";
import { Expression, VarExpression, LambdaExpression, AppExpression, DefineExpression, SDefineExpression } from "./Expression";
import { normalise } from "./reduce";


export function evaluate(env: Environment, expression: Expression): any {
    if (expression instanceof VarExpression) {
        console.log("eval params:", env, expression);
        const lookup = env.lookup(expression);
        console.log("lookup got:", lookup);
        return lookup;
    } else if (expression instanceof LambdaExpression) {
        return new Closure(env, expression.variable, expression.body);
    } else if (expression instanceof AppExpression) {
        return apply(evaluate(env, expression.func), evaluate(env, expression.arg));
    } else {
        throw new Error("Unknown expression type");
    }
}

export function apply(clos: any, arg: any): any {
    if (clos instanceof Closure) {
        const extendedEnv = clos.env.extend(clos.variable, arg);
        return evaluate(extendedEnv, clos.body);
    } else if (typeof clos === 'string') {
        return `(${clos} ${arg})`; // Temporary solution, but this means that clos is not yet a value
    } else {
        throw new Error(`Attempted to apply a non-closure value (got [${clos} ${arg}]: [${typeof clos} ${typeof arg}])`);
    }
}

export function runProgram(env: Environment, expressions: Array<Expression>): void {
    let currentEnv = env;
    for (const expr of expressions) {
        if (expr instanceof DefineExpression) {
            currentEnv = currentEnv.extend(expr.variable, evaluate(currentEnv, expr.definition));
        } else if (expr instanceof SDefineExpression) {
            currentEnv = currentEnv.extend(expr.variable, expr.definition);
        } else {
            console.log('in eval:', currentEnv.toString())
            normalise(expr);
            const evalResult = evaluate(currentEnv, expr);
            try {
                console.log("Result (-unbound):", evalResult.toString());
            } catch (e) {
                console.log("Result (+unbound):", evalResult);
            }
        }
    }
}

function addPrime(x: string): string {
    return x + "'";
}

function freshen(used: Array<string>, x: string) {
    let new_x = x;
    while (used.indexOf(new_x) !== -1) {
        new_x = addPrime(x);
    }
    return new_x;
}