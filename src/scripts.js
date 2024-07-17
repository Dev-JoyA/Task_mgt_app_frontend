$(document).ready(function() {
    let tasks = [];
    let sortDirection = 'asc';
    const token = localStorage.getItem('token'); 

    function updateTaskCounts() {
        $('#in-progress-count').text(`(${tasks.filter(task => task.status === 'in-progress').length})`);
        $('#completed-count').text(`(${tasks.filter(task => task.status === 'completed').length})`);
        $('#overdue-count').text(`(${tasks.filter(task => task.status === 'overdue').length})`);
    }

    function sortTasksAlphabetically() {
        ['#in-progress-tasks', '#completed-tasks', '#overdue-tasks'].forEach(selector => {
            const taskElements = $(selector).children('.task').get();
            taskElements.sort((a, b) => {
                const taskATitle = $(a).find('h3').text().trim();
                const taskBTitle = $(b).find('h3').text().trim();
                 if (sortDirection === 'asc') {
                    return taskATitle.localeCompare(taskBTitle);
                } else {
                    return taskBTitle.localeCompare(taskATitle);
                }
            });
            $(selector).append(taskElements);
        });
    }

    function sortTasksByPriority() {
        ['#in-progress-tasks', '#completed-tasks', '#overdue-tasks'].forEach(selector => {
            const taskElements = $(selector).children().get(); 
            taskElements.sort((a, b) => {
                const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
                const priorityA = $(a).find('.priority').text().trim(); 
                const priorityB = $(b).find('.priority').text().trim(); 
                return priorityOrder[priorityA] - priorityOrder[priorityB];
            });
            $(selector).append(taskElements);
        });
    }
    

    function filterTasksByCategory(category) {
        $('.task').each(function() {
            const taskCategory = $(this).find('.task-category').text().toLowerCase();
            $(this).toggle(taskCategory.includes(category.toLowerCase()));
        });
    }

    function previewTasks() {
        const previewWindow = window.open('', 'Task Preview', 'width=600,height=400');
        let previewContent = '<h2>Task Preview</h2><ul>';
        tasks.forEach(task => {
            previewContent += `<li><strong>${task.title}</strong> - ${task.desc}</li>`;
        });
        previewContent += '</ul>';
        previewWindow.document.write(previewContent);
    }

    function ensureTasksArray(tasks) {
        if (!Array.isArray(tasks)) {
            console.error('tasks is not an array:', tasks);
            return [];
        }
        return tasks;
    }
    

    // Use the utility function after any potential mutation
    tasks = ensureTasksArray(tasks);

    function createTaskElement(task) {
        const priorityColors = {
            'High': task.status === 'in-progress' ? 'bg-red-200 text-black' : 'bg-gray-200 text-red-500',
            'Medium': task.status === 'in-progress' ? 'bg-orange-200 text-black' : 'bg-gray-200 text-orange-500',
            'Low': task.status === 'in-progress' ? 'bg-green-200 text-black' : 'bg-gray-200 text-green-500'
        };

        const taskElement = $(`
        <div class="mt-5 gap-x-10 task" data-id="${task.id}" draggable="true">
         <div class="flex items-center mb-1">
            <p class="text-sm ${priorityColors[task.priority]} p-1 rounded priority">${task.priority}</p>
            <p class="due-date pl-4">${task.status === 'overdue' ? formatDate(task.endTime) : formatTime(task.endTime)}</p>
            <p class="text-sm bg-blue-200 text-blue-800 p-1 ml-2 rounded task-category">${task.category}</p>
         </div>
         <div class="task-content bg-gray-300 rounded shadow max-w-xs w-full">
            <div class="flex justify-between">
                <h3 class="text-lg font-bold">${task.title}</h3>
                <a href="#" class="items-center text-gray-600"><span class="material-icons">more_vert</span></a>
            </div>
            <div class="text-gray-500">
                <p>${task.desc}</p>
                <div class="flex items-center mt-3 rounded-md">
                    <span class="material-icons">format_list_bulleted</span>
                    <div class="text-sm mr-2">${task.people}/${task.totalPeople}</div>
                </div>
            </div>
            <div class="flex justify-between items-center mt-1">
                <div class="flex">
                    ${task.assigned.split(',').map(person => `<img src="https://i.pravatar.cc/20" alt="${person.trim()}" class="rounded-full size-4">`).join('')}
                </div>
                <div class="mt-2 flex justify-end space-x-2">
                    <button class="visibility-toggle text-black p-1 rounded"><i class="fas fa-eye"></i></button>
                    <button class="delete-task text-black p-1 rounded"><i class="fas fa-trash"></i></button>
                    <button class="edit-task text-black p-1 rounded"><i class="fas fa-edit"></i></button>
                </div>
            </div>
         </div>
         </div>
        `);

        taskElement.on('dragstart', function(e) {
            e.originalEvent.dataTransfer.setData('text', task.id.toString());
        });

        taskElement.find('.delete-task').on('click', function() {
            fetch(`http://127.0.0.1:8000/api/tasks/${task.id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            })
            .then(() => {
                tasks = tasks.filter(t => t.id !== task.id);
                taskElement.remove();
                updateTaskCounts();
                sortTasksByPriority();
            })
            .catch(error => console.error('Error:', error));
        });

        taskElement.find('.edit-task').on('click', function() {
            $('#task-title').val(task.title);
            $('#task-desc').val(task.desc);
            $('#task-priority').val(task.priority);
            $('#task-category').val(task.category);
            $('#task-assigned').val(task.assigned);
            $('#task-people').val(task.people);
            $('#task-start-time').val(task.startTime);
            $('#task-end-time').val(task.endTime);
            $('#task-modal').removeClass('hidden');

            $('#task-form').off('submit').on('submit', function(e) {
                e.preventDefault();
                task.title = $('#task-title').val();
                task.desc = $('#task-desc').val();
                task.priority = $('#task-priority').val();
                task.category = $('#task-category').val();
                task.assigned = $('#task-assigned').val();
                task.people = $('#task-people').val();
                task.startTime = $('#task-start-time').val();
                task.endTime = $('#task-end-time').val();
                fetch(`http://127.0.0.1:8000/api/tasks/${task.id}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}` 
                    },
                    body: JSON.stringify(task),
                })
                .then(response => response.json())
                .then(updatedTask => {
                    taskElement.replaceWith(createTaskElement(updatedTask));
                    $('#task-modal').addClass('hidden');
                    updateTaskCounts();
                    sortTasksByPriority();
                })
                .catch(error => console.error('Error:', error));
            });
        });

        taskElement.find('.visibility-toggle').on('click', function() {
            const icon = $(this).find('i');
            const isHidden = taskElement.find('.text-gray-500').is(':visible');
        
            if (isHidden) {
                taskElement.find('.text-gray-500, .due-date').hide();
                icon.removeClass('fa-eye').addClass('fa-eye-slash');
            } else {
                taskElement.find('.text-gray-500, .due-date').show();
                icon.removeClass('fa-eye-slash').addClass('fa-eye');
            }
        });

        return taskElement;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    function formatTime(dateString) {
        const date = new Date(dateString);
        return `${date.getHours()}:${date.getMinutes()}`;
    }

    $('#sort-link').on('click', function() {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        sortTasksAlphabetically();
    });
    

    $('#add-task-btn').on('click', function() {
        $('#task-form').trigger('reset');
        $('#task-modal').removeClass('hidden');

        $('#task-form').off('submit').on('submit', function(e) {
            e.preventDefault();
            const task = {
                title: $('#task-title').val(),
                desc: $('#task-desc').val(),
                priority: $('#task-priority').val(),
                category: $('#task-category').val(),
                assigned: $('#task-assigned').val(),
                people: $('#task-people').val(),
                totalPeople: $('#task-assigned').val().split(',').length,
                startTime: $('#task-start-time').val(),
                endTime: $('#task-end-time').val(),
                status: 'in-progress'
            };
            if (!token) {
                console.error('Token is missing!');
                alert('You must be logged in to add a task.');
                return;
            }
    
            console.log('Submitting task:', task);
            console.log('Using token:', token);
    
            fetch('http://127.0.0.1:8000/api/tasks/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}` // Include the token in the Authorization header
                },
                body: JSON.stringify(task),
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error('Network response was not ok ' + err.detail);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Task added successfully:', data);
                if (Array.isArray(data)) {
                    tasks = data;
                } else {
                    tasks = [];
                }
                tasks.push(data);
                const taskElement = createTaskElement(data);
                $('#in-progress-tasks').append(taskElement);
                updateTaskCounts();
                sortTasksByPriority();
                $('#task-modal').addClass('hidden');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error adding task: ' + error.message);
            });
        });
    });
    

    $('#cancel-btn').on('click', function() {
        $('#task-modal').addClass('hidden');
    });

    $('.task-list').on('dragover', function(e) {
        e.preventDefault();
    });


    $('.task-list').on('drop', function(e) {
        e.preventDefault();
        const taskId = e.originalEvent.dataTransfer.getData('text');
        const task = tasks.find(t => t.id.toString() === taskId);
    
        if (task) {
            // Update the task's status
            task.status = $(this).attr('id').replace('-tasks', '');
    
            // Send the updated task to the backend
            fetch(`http://127.0.0.1:8000/api/tasks/${task.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}` 
                },
                body: JSON.stringify(task),
            })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(updatedTask => {
                // Remove the old task element
                $(`[data-id='${taskId}']`).remove();
                // Create and append the updated task element
                const taskElement = createTaskElement(updatedTask);
                $(this).append(taskElement);
                updateTaskCounts();
                sortTasksByPriority();
            })
            .catch(error => console.error('Error:', error));
        }
    });
    

    $('#search-input, #search-icon').on('input click', function() {
        const searchTerm = $('#search-input').val().toLowerCase();
        $('.task').each(function() {
            const taskTitle = $(this).find('h3').text().toLowerCase();
            $(this).toggle(taskTitle.includes(searchTerm));
        });
    });

    $('#filter-link').on('click', function() {
        const category = prompt('Enter category to filter tasks:');
        if (category) {
            filterTasksByCategory(category);
        }
    });

    $('#preview-link').on('click', function() {
        previewTasks();
    });

    $('.task-list').on('dragover', function(e) {
        e.preventDefault();
    });

    $('.task-list').on('drop', function(e) {
        e.preventDefault();
        const taskId = e.originalEvent.dataTransfer.getData('text');
        const task = tasks.find(t => t.id.toString() === taskId);
        if (task) {
            task.status = $(this).attr('id').replace('-tasks', '');
            $(this).append(createTaskElement(task));
            updateTaskCounts();
            sortTasksByPriority();
        }
    });

        fetch('http://127.0.0.1:8000/api/tasks/', {
        headers: {
            'Authorization': `Token ${token}`
        }
    }).then(response => response.json())
        .then(data => {
            tasks = data;
            if (Array.isArray(data)) {
                tasks = data;
            } else {
                tasks = [];
            }
            tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                $(`#${task.status}-tasks`).append(taskElement);
            });
            updateTaskCounts();
            sortTasksByPriority();
        })
        .catch(error => console.error('Error:', error));
;


        




function displayMembers() {
    const membersContainer = $('#members');
    membersContainer.empty();
    // Assuming 'members' is an array containing the member objects
    members.forEach(member => {
        membersContainer.append(`
            <div class="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
                <img src="${member.picture}" alt="${member.username}" class="rounded-full w-24 h-24 mb-2">
                <h3 class="text-lg font-bold">${member.username}</h3>
                <p class="text-gray-600">Email: ${member.email}</p>
                <p class="text-gray-600">Phone: ${member.phone}</p>
            </div>
        `);
    });
}


    // Fetch members and display them
    fetch('http://127.0.0.1:8000/api/members/', {
        headers: {
            'Authorization': `Token ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        displayMembers(data);
    })
    .catch(error => console.error('Error fetching members:', error));




const taskes = JSON.parse(localStorage.getItem('tasks')) || [];

function displayTasks() {
    const tasksContainer = $('#all-tasks');
    tasksContainer.empty();

    taskes.forEach(task => {
        const priorityColors = {
            'High': 'bg-red-200 text-black',
            'Medium': 'bg-orange-200 text-black',
            'Low': 'bg-green-200 text-black'
        };

        const taskElement = $(`
            <div class="mt-5 gap-x-10 p-4 bg-gray-300 rounded shadow max-w-xs w-full">
                <div class="flex items-center mb-1">
                    <p class="text-sm ${priorityColors[task.priority]} p-1 rounded">${task.priority}</p>
                    <p class="pl-4">${task.status === 'overdue' ? formatDate(task.endTime) : formatTime(task.endTime)}</p>
                    <p class="text-sm bg-blue-200 text-blue-800 p-1 ml-2 rounded">${task.category}</p>
                </div>
                <div class="flex justify-between">
                    <h3 class="text-lg font-bold">${task.title}</h3>
                    <a href="#" class="items-center text-gray-600"><span class="material-icons">more_vert</span></a>
                </div>
                <div class="text-gray-500">
                    <p>${task.desc}</p>
                    <div class="flex items-center mt-3 rounded-md">
                        <span class="material-icons">format_list_bulleted</span>
                        <div class="text-sm mr-2">${task.people}/${task.totalPeople}</div>
                    </div>
                </div>
                <div class="flex justify-between items-center mt-1">
                    <div class="flex">
                        ${task.assigned.split(',').map(person => `<img src="https://i.pravatar.cc/20" alt="${person.trim()}" class="rounded-full size-4">`).join('')}
                    </div>
                </div>
            </div>
        `);
        tasksContainer.append(taskElement);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return `${date.getHours()}:${date.getMinutes()}`;
}

displayTasks();


function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return `${date.getHours()}:${date.getMinutes()}`;
}

displayTasks();


   // Switch between login and signup forms
   $('#show-user-signup').click(function(e) {
    e.preventDefault();
    $('#user-login-form').hide();
    $('#user-signup-form').show();
});

$('#show-user-login').click(function(e) {
    e.preventDefault();
    $('#user-signup-form').hide();
    $('#user-login-form').show();
});

$('#show-admin-signup').click(function(e) {
    e.preventDefault();
    $('#admin-login-form').hide();
    $('#admin-signup-form').show();
});

$('#show-admin-login').click(function(e) {
    e.preventDefault();
    $('#admin-signup-form').hide();
    $('#admin-login-form').show();
});

// Handle user signup
$('#user-signup-form form').on('submit', function(e) {
    e.preventDefault();

    let formData = new FormData();
    formData.append('name', $('#signup-name').val());
    formData.append('surname', $('#signup-surname').val());
    formData.append('username', $('#signup-username').val());
    formData.append('email', $('#signup-email').val());
    formData.append('phone_number', $('#signup-phone').val());
    formData.append('password', $('#signup-password').val());
    formData.append('profile_picture', $('#signup-picture')[0].files[0]);

    $.ajax({
        url: 'http://127.0.0.1:8000/api/users/register/',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            alert('User registered successfully!');
            $('#user-signup-form').trigger('reset');
            $('#user-signup-form').hide();
            $('#user-login-form').show();
        },
        error: function(error) {
            alert('Error: ' + error.responseJSON.detail);
        }
    });
});


// Handle user login
$('#user-login-form form').on('submit', function(e) {
    e.preventDefault();

    const loginData = {
        email: $('#user-login-form input[name="email"]').val(),
        password: $('#user-login-form input[name="password"]').val()
    };

    console.log("this is the login data ")
    console.log(loginData)

    $.ajax({
        url: 'http://127.0.0.1:8000/api/users/login/',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(loginData),
        success: function(response) {
            localStorage.setItem('token', response.token);
            alert('Login successful!');
            window.location.href = '/src/dashboard.html';
        },
        error: function(error) {
            console.error('Login Error:', error);
            alert('Error: ' + (error.responseJSON?.detail || 'An error occurred'));

            // Redirect to signup if invalid credentials
            if (error.responseJSON?.non_field_errors?.[0] === 'Invalid credentials') {
                alert('User does not exist. Please sign up.');
                $('#user-login-form').hide();
                $('#user-signup-form').show();
            }
        }
    });
});

let currentUser = null; 

function updateUserIcon() {
    if (currentUser) {
        $('#user-icon').html(`<img src="${currentUser.picture}" alt="${currentUser.username}" class="rounded-full w-8 h-8">`);
        $('#logout-btn').removeClass('hidden');
    } else {
        $('#user-icon').html('<span class="material-icons">person</span>');
        $('#logout-btn').addClass('hidden');
    }
}

function login(username, password) {
    // Replace with your actual login implementation
    fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            currentUser = data.user; // Store user info
            updateUserIcon();
            fetchMembers();
        } else {
            console.error('Login failed:', data);
        }
    })
    .catch(error => console.error('Error logging in:', error));
}

// Logout function
$('#logout-btn').on('click', function() {
    currentUser = null; 
    updateUserIcon();
    // Optionally clear the token and redirect
    localStorage.removeItem('token');
     window.location.href = '/login';
});

// Fetch members on page load
fetchMembers();
updateUserIcon(); 

})
