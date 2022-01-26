let search = $('#search')

search.on('keyup', function (event) {
    let research = search.val();
    console.log(research)
    $.ajax({
        url: `/api/v1/travels/?country${research}`,
        method: 'GET',
        data: 'JSON',
        success: function (response, status, status_msg) {
            createList(response);
        },
        error: function (err, error_msg, error_status) {
            console.log(err);
        }
    });
});


function createList(data) {
    $('.container').empty();
    data.forEach(el => {
        let content = `  <div class="box">
        <span></span>
        <div class="content">
            <h2>${value.name}</h2>
            <p>${value.summary} </p>
            <a href="/overview/:id">Read More</a>
        </div>
    </div>`
    $('container').html(content)
    });
}