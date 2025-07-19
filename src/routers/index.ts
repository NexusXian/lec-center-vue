import { createWebHistory, createRouter } from 'vue-router'

import HomePage from '../pages/HomePage.vue'
//import auth pages
import LoginPage from "../pages/auth/LoginPage.vue";
import RegisterPage from "../pages/auth/RegisterPage.vue";
//import profile pages
import ProfilePage from "../pages/user/ProfilePage.vue";
import InfoPage from "../pages/user/ProfilePages/InfoPage.vue";
import UpdatePassword from "../pages/user/ProfilePages/UpdatePassword.vue";
import UpdateAvatar from "../pages/user/ProfilePages/UpdateAvatar.vue";
//import AdminPage
import AdminPage from "../pages/admin/AdminPage.vue";

import RankPage from "../pages/rank/RankPage.vue";

import NoticePage from "../pages/notice/NoticePage.vue";
import NoticeListPage from "../pages/notice/NoticeListPage.vue";
import NoticeDetailPage from "../pages/notice/NoticeDetailPage.vue"; // 新增：通知详情页
import CreateNotice from "../pages/notice/CreateNotice.vue";
import EditNotice from "../pages/notice/EditNotice.vue";

import LinkPage from "../pages/link/LinkPage.vue";
import ClockInPage from "../pages/clock/ClockInPage.vue";
// 新增：导入签到记录相关页面
import CheckinRecordList from "../pages/clock/CheckinRecordList.vue"; // 签到记录列表页
import CheckinRecordDetail from "../pages/clock/CheckinRecordDetail.vue"; // 签到记录详情页

import RecordPage from "../pages/record/RecordPage.vue";
import DayDetail from "../pages/record/DayDetail.vue";

const routes = [
    { path: '/', component: HomePage},
    { path: '/user/login', component: LoginPage},
    { path: '/user/register', component: RegisterPage},
    {
        path: '/profile',
        name: 'profile',
        component: ProfilePage,
        redirect: {name: 'profile-info'},
        children: [
            {
                path: 'info',
                name: 'profile-info',
                component: InfoPage
            },
            {
                path: 'update-avatar',
                name: 'profile-update-avatar',
                component: UpdateAvatar
            },
            {
                path: 'update-password',
                name: 'profile-update-password',
                component: UpdatePassword
            },
        ]
    },
    { path: '/admin-dashboard', component: AdminPage},
    { path: '/ranking', component: RankPage},
    {
        path: '/notice',
        name: 'notice',
        component: NoticePage,
        redirect: { name: 'notice-list' },
        children: [
            {
                path: 'list',
                name: 'notice-list',
                component: NoticeListPage
            }
        ]
    },
    {
        path: '/notice/:id',  // 新增：通知详情路由
        name: 'notice-detail',
        component: NoticeDetailPage
    },
    {
        path: '/notice/create',
        name: 'notice-create',
        component: CreateNotice
    },
    {
        path: '/notice/edit/:id',
        name: 'notice-edit',
        component: EditNotice
    },
    {path: '/links' ,component: LinkPage},
    {path: '/clock-in' ,component: ClockInPage},
    // 新增：签到记录相关路由
    {
        path: '/clock-in/records',
        name: 'checkin-record-list',
        component: CheckinRecordList
    },
    {
        path: '/clock-in/record/:id',
        name: 'checkin-record-detail',
        component: CheckinRecordDetail
    }
    ,
    {
        path: '/clock/record',
        name: 'record-day',
        component: RecordPage
    }
    ,
    {
        path: '/attendance/day',
        name: 'DayDetail',
        component: DayDetail
    }

]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router