const classSelect = document.getElementById('classSelect');
const teacherSelect = document.getElementById('teacherSelect');
const theadRow = document.getElementById('theadRow');
const tbody = document.getElementById('tbody');
const urgentBox = document.getElementById('messageUrgent');

let edtData = null;

async function loadEDT() {
  try {
    const res = await fetch('edt.json?_=' + Date.now());
    edtData = await res.json();
    initSelectors();
    renderTable();
    renderUrgent();
  } catch (e) {
    console.error('Erreur chargement edt.json', e);
  }
}

function initSelectors() {
  classSelect.innerHTML = '<option value="">– choisir –</option>';
  teacherSelect.innerHTML = '<option value="">– aucun –</option>';

  edtData.classes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    classSelect.appendChild(opt);
  });

  edtData.teachers.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    teacherSelect.appendChild(opt);
  });

  classSelect.addEventListener('change', renderTable);
  teacherSelect.addEventListener('change', renderTable);
}

function renderUrgent() {
  if (edtData.messageUrgent && edtData.messageUrgent.trim() !== '') {
    urgentBox.textContent = edtData.messageUrgent;
    urgentBox.classList.remove('hidden');
  } else {
    urgentBox.classList.add('hidden');
  }
}

function renderTable() {
  const selectedClass = classSelect.value;
  const selectedTeacher = teacherSelect.value;

  // au moins une vue choisie
  if (!selectedClass && !selectedTeacher) {
    tbody.innerHTML = '';
    // header jours
    buildHeader();
    return;
  }

  buildHeader();

  tbody.innerHTML = '';

  edtData.slots.forEach(slot => {
    const tr = document.createElement('tr');

    const timeTd = document.createElement('td');
    timeTd.className = 'time-cell';
    timeTd.textContent = slot;
    tr.appendChild(timeTd);

    edtData.days.forEach(day => {
      const td = document.createElement('td');

      const courses = edtData.courses.filter(c => {
        const matchDay = c.day === day && c.slot === slot;
        const matchClass = selectedClass ? c.class === selectedClass : true;
        const matchTeacher = selectedTeacher ? c.teacher === selectedTeacher : true;
        return matchDay && matchClass && matchTeacher;
      });

      if (courses.length === 0) {
        td.innerHTML = '';
      } else {
        courses.forEach(course => {
          const div = document.createElement('div');
          div.classList.add('course');

          // statut
          switch (course.status) {
            case 'absent':
              div.classList.add('status-absent');
              break;
            case 'cancelled':
              div.classList.add('status-cancelled');
              break;
            case 'moved':
              div.classList.add('status-moved');
              break;
            case 'room-change':
              div.classList.add('status-room-change');
              break;
            default:
              break;
          }

          const title = document.createElement('div');
          title.className = 'course-title';
          title.textContent = course.subject + ' (' + course.class + ')';

          const meta = document.createElement('div');
          meta.className = 'course-meta';
          meta.textContent = course.teacher + ' – salle ' + course.room;

          div.appendChild(title);
          div.appendChild(meta);

          if (course.note && course.note.trim() !== '') {
            const note = document.createElement('div');
            note.className = 'course-meta';
            note.textContent = course.note;
            div.appendChild(note);
          }

          td.appendChild(div);
        });
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

function buildHeader() {
  // reset header
  theadRow.innerHTML = '';
  const thTime = document.createElement('th');
  thTime.textContent = 'Heure';
  theadRow.appendChild(thTime);

  edtData.days.forEach(day => {
    const th = document.createElement('th');
    th.textContent = day;
    theadRow.appendChild(th);
  });
}

// auto-refresh toutes les 15s pour voir les changements de edt.json
setInterval(loadEDT, 15000);

loadEDT();
