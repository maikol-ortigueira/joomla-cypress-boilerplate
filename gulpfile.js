const { hasConfigJsonFile, initialInfo } = require('./extension2joomla/src/info');

if (hasConfigJsonFile() === false) {
    initialInfo();
} else {
    const tareas = require('./extension2joomla/src/tasks');
    const { hasPackage } = require('./extension2joomla/src/utils')
    const {task, series, parallel} = require('gulp')
    
    task('clean', series(...tareas.cleanTasks));
    task('copy', series(...tareas.copyTasks));
    task('releaseTasks', series(...tareas.releaseTasks));
    if (hasPackage())
    {
        task('releasePackage', series(tareas.releasePackage));
    }

    // if hasPackage task release is releasePackage else release
    task('release', series(hasPackage() ? 'releasePackage' : 'releaseTasks'));
    task('watch', parallel(...tareas.watchTasks));
    
    task('default', series('watch'));

}