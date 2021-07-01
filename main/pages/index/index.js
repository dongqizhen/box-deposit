//index.js
const app = getApp();

Page({
    data: {
        avatarUrl: "./user-unlogin.png",
        userInfo: {},
        hasUserInfo: false,
        logged: false,
        takeSession: false,
        requestResult: "",
        canIUseGetUserProfile: false,
        canIUseOpenData: wx.canIUse("open-data.type.userAvatarUrl"), // 如需尝试获取用户信息可改为false
    },

    onLoad() {
        if (wx.getUserProfile) {
            this.setData({
                canIUseGetUserProfile: true,
            });
        }
    },

    async onShow() {
        this.getTabBar().init();
        if (wx.getStorageSync("isLogin")) {
            await app.getUserInfo();
        }
    },

    //扫码
    async scan() {
        const wx_userInfo = wx.getStorageSync("wx_userInfo");

        if (!wx_userInfo) {
            await app.globalData.getUserProfile();
        }

        if (wx.getStorageSync("isLogin")) {
            await app.getUserInfo();
        }

        if (!wx.getStorageSync("isLogin")) {
            wx.navigateTo({
                url: "../login-frame/login-frame",
            });
            return;
        }

        const { get_kdy_user_info } = wx.getStorageSync("userInfo");

        if (get_kdy_user_info == null) {
            wx.showToast({
                title: "请与运营商联系",
                icon: "none",
            });
            return;
        }

        wx.scanCode({
            success(res) {
                console.log(res);
                const { path, errMsg } = res;
                if (errMsg == "scanCode:ok") {
                    if (path) {
                        wx.navigateTo({
                            url: path,
                        });
                    } else {
                        wx.showToast({
                            title: "二维码不匹配",
                            icon: "none",
                            duration: 3000,
                        });
                    }
                } else {
                    wx.showToast({
                        title: "二维码无效",
                        icon: "none",
                        duration: 3000,
                    });
                }
            },
            fail: () => {
                wx.showToast({
                    title: "扫码已取消",
                    icon: "none",
                    duration: 3000,
                });
            },
        });
    },

    onGetUserInfo: function (e) {
        if (!this.data.logged && e.detail.userInfo) {
            this.setData({
                logged: true,
                avatarUrl: e.detail.userInfo.avatarUrl,
                userInfo: e.detail.userInfo,
                hasUserInfo: true,
            });
        }
    },
});
