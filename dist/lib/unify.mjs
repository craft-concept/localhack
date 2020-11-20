const isLVar = (x) => x !== null && "__type" in x && x.__type === "LVar";
// Can we unify against two APIs instead of two data-structures?
export const unify = (a, b) => {
    if (isLVar(a)) {
        return { [a.name]: b };
    }
    else if (isLVar(b))
        return unify(b, a);
};
