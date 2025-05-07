<?php
/*
Plugin Name: Falling Objects
Description: Add draggable, falling images with physics using a simple shortcode [falling_objects].
Version: 2.2
Author: Dariush & ChatGPT
*/

add_action('admin_enqueue_scripts', function($hook) {
    if ($hook !== 'toplevel_page_falling-objects') return;
    wp_enqueue_media(); // ✅ This enables the media uploader
});


add_action('wp_enqueue_scripts', function() {
    wp_enqueue_script('matter-js', 'https://cdn.jsdelivr.net/npm/matter-js@0.19.0/build/matter.min.js', [], null, true);
    wp_enqueue_script('falling-objects-js', plugin_dir_url(__FILE__) . 'assets/script.js', ['matter-js'], '1.1', true);
    wp_enqueue_style('falling-objects-css', plugin_dir_url(__FILE__) . 'assets/style.css');
});

add_shortcode('falling_objects', function() {
    return '<div id="falling-objects-container"></div>';
});

add_action('admin_menu', function() {
    add_menu_page('Falling Objects', 'Falling Objects', 'manage_options', 'falling-objects', 'falling_objects_settings_page', 'dashicons-image-flip-horizontal');
});

function falling_objects_settings_page() {
    $images = get_option('falling_objects_images', []);
    $drop_count = get_option('falling_objects_count', 3);
    ?>
    <div class="wrap">
        <h1>Falling Objects Settings</h1>
        <form method="post" action="options.php">
            <?php settings_fields('falling_objects_group'); ?>
            <h2>Upload or Select Images</h2>
            <div id="falling-objects-preview" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <?php foreach ($images as $url): ?>
                    <div class="falling-image-wrapper" style="position:relative; display:inline-block;">
                        <img src="<?php echo esc_url($url); ?>" width="80" height="80" />
                        <button type="button" class="remove-image" style="position:absolute;top:0;right:0;background:red;color:white;border:none;">×</button>
                        <input type="hidden" name="falling_objects_images[]" value="<?php echo esc_attr($url); ?>">
                    </div>
                <?php endforeach; ?>
            </div>
            <input type="button" class="button" id="add-image" value="Add Image" />
            <hr>
            <h2>Automatic Drop Count</h2>
            <input type="number" name="falling_objects_count" value="<?php echo esc_attr($drop_count); ?>" min="0" max="50" />
            <?php submit_button(); ?>
        </form>
    </div>
    <script>
        jQuery(document).ready(function($){
            $('#add-image').click(function(e){
                e.preventDefault();
                wp.media({
                    title: 'Select or Upload Image',
                    button: { text: 'Use this image' },
                    multiple: false
                }).on('select', function(){
                    var attachment = wp.media.frame.state().get('selection').first().toJSON();
                    $('#falling-objects-preview').append(
                        `<div class="falling-image-wrapper" style="position:relative;display:inline-block;">
                            <img src="${attachment.url}" width="80" height="80" />
                            <button type="button" class="remove-image" style="position:absolute;top:0;right:0;background:red;color:white;border:none;">×</button>
                            <input type="hidden" name="falling_objects_images[]" value="${attachment.url}">
                        </div>`
                    );
                }).open();
            });

            $('#falling-objects-preview').on('click', '.remove-image', function(){
                $(this).parent().remove();
            });
        });
    </script>
    <?php
}

add_action('admin_init', function() {
    register_setting('falling_objects_group', 'falling_objects_images');
    register_setting('falling_objects_group', 'falling_objects_count');
});

// Pass image URLs and drop count to JS
add_action('wp_footer', function() {
    $images = get_option('falling_objects_images', []);
    $count = get_option('falling_objects_count', 3);
    echo '<script>window.fallingImages = ' . json_encode($images) . ';';
    echo 'window.fallingAutoCount = ' . intval($count) . ';</script>';
});
