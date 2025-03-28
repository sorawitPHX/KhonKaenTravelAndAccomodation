const redirectIfAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect("/"); // ถ้าล็อกอินแล้วให้กลับไปหน้าแรก
    }
    next();
};

const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect("/signIn"); // ถ้ายังไม่ได้ล็อกอินให้ไปที่หน้าเข้าสู่ระบบ
    }
    next();
};

const requireAuthApi = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(403).json({error: 'กรุณาเข้าสู่ระบบก่อน'});
    }
    next()
};

const setUserSession = (req, res, next) => {
    res.locals.user = req.session.userId ? { 
        id: req.session.userId, 
        name: req.session.userName,
        profile_image: req.session.userProfile,
        role: req.session.userRole,
    } : null;
    next();
};

module.exports = { redirectIfAuthenticated, requireAuth, setUserSession, requireAuthApi };
