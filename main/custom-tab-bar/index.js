Component({
	data: {
		active: 0,
		list: [
			{
				icon: 'diamond-o',
				text: '存',
				url: '/pages/index/index'
			},
			{
				icon: 'friends-o',
				text: '我的',
				url: '/pages/me/me'
			}
		]
	},

	methods: {
		onChange(event) {
			this.setData({ active: event.detail });
			wx.switchTab({
				url: this.data.list[event.detail].url
			});
		},

		init() {
			const page = getCurrentPages().pop();
			this.setData({
				active: this.data.list.findIndex(item => item.url === `/${page.route}`)
			});
		}
	}
});
