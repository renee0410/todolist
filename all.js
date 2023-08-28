// api網址
const apiUrl = 'https://todoo.5xcamp.us';
// 切換頁面
const signHref = document.getElementById('signHref');
const signUpBlock = document.querySelector('.signUp');
const logInBlock = document.querySelector('.logIn');
const todoBlock = document.querySelector('.todo');
const jsView = document.querySelectorAll('.js-view');

/**
 * 切換頁面
 * @param {欲切換的頁面} page
 */
function switchPage(page) {
  jsView.forEach((item) => {
    item.classList.remove('view');
  });
  page.classList.add('view');
}

// 登入頁面
const logInform = document.getElementById('logInform');
const hint = document.querySelector('.hint');
const member = document.querySelector('.member');

logInform.addEventListener('submit', (e) => {
  e.preventDefault();
  const logInData = new FormData(logInform);
  // console.log(logInData);
  // 轉成物件
  const logInValues = Object.fromEntries(logInData);
  if (logInValues.email === '') {
    hint.textContent = '此欄位不可為空';
    return;
  }

  // 呼叫登入api
  function logIn(logInValues) {
    axios.post(`${apiUrl}/users/sign_in`, {
      user: logInValues,
    })
      .then((res) => {
        axios.defaults.headers.common.Authorization = res.headers.authorization;
        alert('登入成功');
        // 清空資料
        logInform.reset();
        // 進入todo內頁
        switchPage(todoBlock);
        // 顯示使用者
        member.textContent = `${res.data.nickname}的待辦`;
        // 呼叫取得todo api
        axios.get(`${apiUrl}/todos`)
          .then((res) => {
            todoData = res.data.todos;
            updateList();
          })
          .catch((error) => console.log(error.response));
      })
      .catch((error) => alert(error.response.data.message));
  }
  logIn(logInValues);
});

// 切換到註冊頁面
signHref.addEventListener('click', () => {
  switchPage(signUpBlock);
});

// 註冊頁面
const signForm = document.getElementById('sign-form');
const logInBtn = document.getElementById('logInBtn');

signForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // 使用FormData獲取表單中所有值
  const signData = new FormData(signForm);
  // 轉換成物件
  const signFormValues = Object.fromEntries(signData);
  if (signFormValues.pwd2 !== signFormValues.pwd) {
    alert('密碼不一致');
    return;
  }

  // 呼叫註冊api
  function signUP(signFormValues) {
    axios.post(`${apiUrl}/users`, {
      user: signFormValues,
    })
      .then((res) => {
        axios.defaults.headers.common.Authorization = res.headers.authorization;
        alert('註冊成功');
        // 進入todo內頁
        switchPage(todoBlock);
        // 顯示使用者
        member.textContent = `${res.data.nickname}的待辦`;
      })
      .catch((error) => alert(error.response.data.error));
  }
  signUP(signFormValues);
});
// 點擊登入按鈕
logInBtn.addEventListener('click', () => {
  switchPage(logInBlock);
})

// 登出
const logOutBtn = document.querySelector('#log-out-btn');
logOutBtn.addEventListener('click', () => {
  function logOut() {
    axios.delete(`${apiUrl}/users/sign_out`)
      .then((res) => {
        // 刪除token
        axios.defaults.headers.common.Authorization = null;
        alert('已登出');
        // 進入登入畫面
        switchPage(logInBlock);
      })
      .catch((error) => console.log(error.response));
  }
  logOut();
});

// 內頁
const list = document.querySelector('.list');
const addBtn = document.querySelector('.btn_add');
const textInput = document.querySelector('.card input');
const tab = document.querySelector('.tab');
const workNum = document.querySelector('#workNum');
const deleteBtn = document.querySelector('#deleteBtn');

let tabStatus = 'all';

// 資料初始化渲染
let todoData = [
// {
// id: -2,
// content: '代辦一',
// checked: true,
// },
// {
// id: -3,
// content: '代辦二',
// checked: false,
// }
];
// 顯示的資料
let showData = [];
updateList();

// 組字串，顯示在畫面上
function updateList() {
  if (tabStatus === 'all') {
    showData = todoData;
  } else if (tabStatus === 'work') {
    showData = todoData.filter((item) => !item.completed_at);
  } else {
    showData = todoData.filter((item) => !!item.completed_at);
  }

  // 計算待完成數量
  const todoLength = todoData.filter((item) => !item.completed_at);
  workNum.textContent = todoLength.length;

  let str = '';
  showData.forEach((item) => {
    str += `
      <li data-id=${item.id}>
        <label class="checkbox" for="" >
          <input type="checkbox" ${item.completed_at ? 'checked' : ''}/>
          <span>${item.content}</span>
        </label>
        <a href="#" class="delete"></a>
      </li>
    `;
  });
  list.innerHTML = str;
}

function addTodo() {
  // 判斷有無輸入
  if (textInput.value !== '') {
    // 新增的TODO內容
    const todo = {
      content: textInput.value,
    };
    // 呼叫api
    axios.post(`${apiUrl}/todos`, {
      todo,
    })
      .then((res) => {
        // 加進第一筆資料
        todoData.unshift(res.data);
        // 更新畫面
        updateList();
        // 清空輸入匡
        textInput.value = '';
      })
      .catch((error) => alert('新增失敗'));
  }
}

// 新增代辦事項
addBtn.addEventListener('click', () => {
  addTodo();
});

// 監聽列表點擊
list.addEventListener('click', (e) => {
  // 刪除
  if (e.target.nodeName === 'A') {
    const id = e.target.parentNode.getAttribute('data-id');
    // 轉換成索引值
    const idx = todoData.findIndex((item) => item.id === id);
    // 如果有找到索引(沒找到會回傳-1)
    if (idx !== -1) {
      // 呼叫刪除api
      axios.delete(`${apiUrl}/todos/${id}`)
        .then((res) => {
          todoData.splice(idx, 1);
          updateList();
          alert(res.data.message);
        })
        .catch((error) => alert('刪除失敗'));
    }
  } else {
    // 切換打勾功能
    const id = e.target.parentNode.parentNode.getAttribute('data-id');
    // 呼叫切換狀態api
    axios.patch(`${apiUrl}/todos/${id}/toggle`, {})
      .then((res) => {
        // 轉換成索引值
        const idx = todoData.findIndex((item) => item.id === id);
        // 如果有找到索引(沒找到會回傳-1)
        if (idx !== -1) {
          todoData[idx].completed_at = res.data.completed_at;
          updateList();
        }
      })
      .catch((error) => console.log(error.response));
  }
});

// 點擊tab狀態
tab.addEventListener('click', (e) => {
  const activeTab = tab.querySelector('.active');
  if (activeTab) {
    activeTab.classList.remove('active');
  }
  e.target.classList.add('active');

  tabStatus = e.target.getAttribute('data-tab');
  updateList();
});

// 點擊清除已完成項目
deleteBtn.addEventListener('click', () => {
  todoData.forEach((item) => {
    if (item.completed_at) {
      axios.delete(`${apiUrl}/todos/${item.id}`)
        .then((res) => {
          // 轉換成索引值
          const idx = todoData.findIndex((items) => items.id === item.id);
          // 如果有找到索引(沒找到會回傳-1)
          if (idx !== -1) {
            todoData.splice(idx, 1);
          }
          updateList();
        })
        .catch((error) => alert('刪除失敗'));
    }
  });
});

// 呼叫api
// const apiUrl = 'https://todoo.5xcamp.us'
// 註冊功能
// function signUP(signFormValues) {
// 	axios.post(`${apiUrl}/users`, {
// 		"user": signFormValues
// 	})
// 	.then((res) => {
// 		axios.defaults.headers.common['Authorization'] = res.headers.authorization;
// 		alert('註冊成功');
// 		//
// 		switchPage(todoBlock);
// 	})
// 	.catch((error) => alert(error.response.data.error))
// }
// //登入功能
// function logIn(email, password) {
// 	axios.post(`${apiUrl}/users/sign_in`, {
// 		"user": {
// 			"email": email,
// 			"password": password,
// 		}
// 	})
// 	.then((res) => {
// 		axios.defaults.headers.common['Authorization'] = res.headers.authorization})
// 	.catch((error) => console.log(error.response))
// }
// // 取得TODO
// function getTodo() {
// 	axios.get(`${apiUrl}/todos`)
// 	.then((res) => console.log(res))
// 	.catch((error) => console.log(error.response))
// }
// // 新增TODO
// function addTodo(todo) {
// 	axios.post(`${apiUrl}/todos`, {
// 		"todo": {
// 			"content": todo
// 		}
// 	})
// 	.then((res) => console.log(res))
// 	.catch((error) => console.log(error.response))
// }
// // 修改TODO
// function updateTodo(todo, todoId) {
// 	axios.put(`${apiUrl}/todos/${todoId}`, {
// 		"todo": {
// 			"content": todo
// 		}
// 	})
// 	.then((res) => console.log(res))
// 	.catch((error) => console.log(error.response))
// }
// // 刪除TODO
// function deleteTodo(todoId) {
// axios.delete(`${apiUrl}/todos/${todoId}`)
// .then((res) => console.log(res))
// .catch((error) => console.log(error.response))
// }
// // 更新TODO代辦狀態
// function toggleTodo(todoId) {
// 	axios.patch(`${apiUrl}/todos/${todoId}/toggle`, {})
// 	.then((res) => console.log(res))
// 	.catch((error) => console.log(error.response))
// }
// 登出
// function logOut() {
// 	axios.delete(`${apiUrl}/users/sign_out`)
// 	.then((res) => console.log(res))
// 	.catch((error) => console.log(error.response))
// }
