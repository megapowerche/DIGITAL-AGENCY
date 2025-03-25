<?php
header('Content-Type: application/json');

// Database configuration
$db_host = 'localhost';
$db_user = 'root';  // Change this to your database username
$db_pass = '';      // Change this to your database password
$db_name = 'safesure_db';

// Get POST data
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$service = $_POST['service'] ?? '';
$description = $_POST['description'] ?? '';

// Validate data
if (empty($name) || empty($email) || empty($service) || empty($description)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

try {
    // Create database connection
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Prepare SQL statement
    $stmt = $conn->prepare("INSERT INTO service_inquiries (name, email, service, description, created_at) VALUES (:name, :email, :service, :description, NOW())");
    
    // Bind parameters
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':service', $service);
    $stmt->bindParam(':description', $description);
    
    // Execute the statement
    $stmt->execute();

    // Send email notification to admin
    $to = "admin@safesure.com";
    $subject = "New Service Inquiry";
    $message = "Name: " . $name . "\n";
    $message .= "Email: " . $email . "\n";
    $message .= "Service: " . $service . "\n";
    $message .= "Description: " . $description . "\n";
    
    $headers = "From: " . $email . "\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    mail($to, $subject, $message, $headers);

    echo json_encode(['success' => true, 'message' => 'Inquiry submitted successfully']);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?> 