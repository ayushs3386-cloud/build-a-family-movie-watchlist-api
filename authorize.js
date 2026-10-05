
export function authorizeModification(req,res,next) {
    const role = req.user.role;
        const isParent = role === "parent";
        const isChild = role === "child";
        const isSelf = String(req.params.userId) === String(req.user.id);

        if (!isParent && !(isChild && isSelf)) {
            return res.status(403).json({"error": "Access denied"})
        }
        next();
}
