import { Closure, Environment } from "./env";
import { Expression, VarExpression, LambdaExpression, AppExpression, DefineExpression } from "./Expression";


export function evaluate(env: Environment, expression: Expression): any {
    console.log("Evaluating:", expression, "Under:", env);
    if (expression instanceof VarExpression) {
        return env.lookup(expression);
    } else if (expression instanceof LambdaExpression) {
        return new Closure(env, expression.var, expression.body);
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
    } else {
        throw new Error("Attempted to apply a non-closure value");
    }
}

export function runProgram(env: Environment, expressions: Array<Expression>): void {
    let currentEnv = env;
    for (const expr of expressions) {
        if (expr instanceof DefineExpression) {
            currentEnv = currentEnv.extend(expr.var, evaluate(env, expr.definition));
        } else {
            const evalResult = evaluate(currentEnv, expr);
            console.log("Result:", evalResult.toString());
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